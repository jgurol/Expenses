
import { Badge } from "@/components/ui/badge";
import { ImportSection } from "@/components/ImportSection";
import { BookkeeperDashboard } from "@/components/BookkeeperDashboard";
import { ClassifierView } from "@/components/ClassifierView";
import { useAddExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { UserRole, Expense, AccountCode } from "@/pages/Index";

interface MainContentProps {
  currentRole: UserRole;
  expenses: Expense[];
  accountCodes: AccountCode[];
  importedExpenses: Expense[];
  onExpensesUploaded: (expenses: Expense[]) => void;
  onDeleteImportedExpense: (expenseId: string) => void;
  onBulkDeleteImportedExpenses: (expenseIds: string[]) => void;
  onClearImportedExpenses: () => void;
  setImportedExpenses: (expenses: Expense[]) => void;
  onExpenseClassified: (expenseId: string, accountCode: string) => void;
  onDeleteUnclassifiedExpense: (expenseId: string) => void;
  onBulkDeleteUnclassifiedExpenses: (expenseIds: string[]) => void;
}

export const MainContent = ({
  currentRole,
  expenses,
  accountCodes,
  importedExpenses,
  onExpensesUploaded,
  onDeleteImportedExpense,
  onBulkDeleteImportedExpenses,
  onClearImportedExpenses,
  setImportedExpenses,
  onExpenseClassified,
  onDeleteUnclassifiedExpense,
  onBulkDeleteUnclassifiedExpenses,
}: MainContentProps) => {
  const addExpenses = useAddExpenses();
  const { isClassifier, isAdmin } = useAuth();

  const handleSaveImportedExpenses = async () => {
    if (importedExpenses.length === 0) {
      toast({
        title: "No Data",
        description: "No expenses to save",
        variant: "destructive",
      });
      return;
    }

    try {
      await addExpenses.mutateAsync(importedExpenses);
      toast({
        title: "Success",
        description: `${importedExpenses.length} expenses saved successfully`,
      });
      setImportedExpenses([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save expenses",
        variant: "destructive",
      });
    }
  };

  const unclassifiedExpenses = expenses.filter(e => !e.classified);
  const classifiedExpenses = expenses.filter(e => e.classified);

  return (
    <div className="mb-8">
      <Badge variant="outline" className="mb-4">
        {currentRole === "bookkeeper" ? "Bookkeeper View" : "Expense Classifier View"}
      </Badge>
      
      {currentRole === "bookkeeper" ? (
        <div className="space-y-8">
          <ImportSection
            importedExpenses={importedExpenses}
            accountCodes={accountCodes}
            onExpensesUploaded={onExpensesUploaded}
            onDeleteImportedExpense={onDeleteImportedExpense}
            onBulkDeleteImportedExpenses={onBulkDeleteImportedExpenses}
            onSaveImportedExpenses={handleSaveImportedExpenses}
            onClearImportedExpenses={onClearImportedExpenses}
            isSaving={addExpenses.isPending}
          />
          
          <BookkeeperDashboard
            expenses={expenses}
            accountCodes={accountCodes}
            unclassifiedExpenses={unclassifiedExpenses}
            onDeleteUnclassifiedExpense={onDeleteUnclassifiedExpense}
            onBulkDeleteUnclassifiedExpenses={onBulkDeleteUnclassifiedExpenses}
          />
        </div>
      ) : (
        // Check if user has classifier or admin permissions before showing ClassifierView
        (isClassifier || isAdmin) ? (
          <ClassifierView
            unclassifiedExpenses={unclassifiedExpenses}
            classifiedExpenses={classifiedExpenses}
            accountCodes={accountCodes}
            onExpenseClassified={onExpenseClassified}
            onExpenseDeleted={onDeleteUnclassifiedExpense}
          />
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
              <p className="text-slate-600">You don't have permission to access the classifier view.</p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

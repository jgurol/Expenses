import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ImportSection } from "@/components/ImportSection";
import { BookkeeperDashboard } from "@/components/BookkeeperDashboard";
import { ClassifierView } from "@/components/ClassifierView";
import { useExpenses, useAddExpenses, useClassifyExpense } from "@/hooks/useExpenses";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useBulkDeleteExpenses } from "@/hooks/useBulkDeleteExpenses";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "@/hooks/use-toast";

export type UserRole = "bookkeeper" | "classifier";

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  spent: number;
  sourceAccount?: string; // Changed from accountCode to sourceAccount
  classified: boolean;
}

export interface AccountCode {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense" | "transfer" | "payment" | "shareholder loan";
}

const Index = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("bookkeeper");
  const [importedExpenses, setImportedExpenses] = useState<Expense[]>([]);
  
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: accountCodes = [], isLoading: accountCodesLoading } = useCategories();
  const addExpenses = useAddExpenses();
  const classifyExpense = useClassifyExpense();
  const deleteExpense = useDeleteExpense();
  const bulkDeleteExpenses = useBulkDeleteExpenses();

  const handleExpensesUploaded = (newExpenses: Expense[]) => {
    console.log('New expenses uploaded:', newExpenses);
    setImportedExpenses(newExpenses);
    toast({
      title: "File Processed",
      description: `${newExpenses.length} expenses ready for review`,
    });
  };

  const handleDeleteImportedExpense = (expenseId: string) => {
    console.log('Deleting imported expense with ID:', expenseId);
    setImportedExpenses(prev => {
      const filtered = prev.filter(expense => expense.id !== expenseId);
      console.log('Remaining expenses after deletion:', filtered.length);
      return filtered;
    });
    toast({
      title: "Expense Removed",
      description: "Expense removed from import",
    });
  };

  const handleBulkDeleteImportedExpenses = (expenseIds: string[]) => {
    console.log('Bulk deleting imported expenses with IDs:', expenseIds);
    setImportedExpenses(prev => {
      const filtered = prev.filter(expense => !expenseIds.includes(expense.id));
      console.log('Remaining expenses after bulk deletion:', filtered.length);
      return filtered;
    });
    toast({
      title: "Expenses Removed",
      description: `${expenseIds.length} expenses removed from import`,
    });
  };

  const handleClearImportedExpenses = () => {
    console.log('Clearing all imported expenses');
    setImportedExpenses([]);
    toast({
      title: "Cleared",
      description: "All imported expenses cleared",
    });
  };

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

  const handleExpenseClassified = async (expenseId: string, accountCode: string) => {
    console.log('Classifying expense with account code:', { expenseId, accountCode });

    try {
      await classifyExpense.mutateAsync({ 
        expenseId, 
        accountCode 
      });
      toast({
        title: "Success",
        description: "Expense classified successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to classify expense",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUnclassifiedExpense = async (expenseId: string) => {
    console.log('Deleting unclassified expense:', expenseId);
    
    try {
      await deleteExpense.mutateAsync(expenseId);
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleBulkDeleteUnclassifiedExpenses = async (expenseIds: string[]) => {
    console.log('Bulk deleting unclassified expenses:', expenseIds);
    
    try {
      await bulkDeleteExpenses.mutateAsync(expenseIds);
      toast({
        title: "Success",
        description: `${expenseIds.length} expenses deleted successfully`,
      });
    } catch (error) {
      console.error('Error bulk deleting expenses:', error);
      toast({
        title: "Error",
        description: "Failed to delete expenses",
        variant: "destructive",
      });
    }
  };

  const unclassifiedExpenses = expenses.filter(e => !e.classified);
  const classifiedExpenses = expenses.filter(e => e.classified);
  const isLoading = expensesLoading || accountCodesLoading;

  console.log('Imported expenses state:', importedExpenses);
  console.log('Imported expenses count:', importedExpenses.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AppHeader currentRole={currentRole} onRoleChange={setCurrentRole} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span className="text-slate-600">Loading...</span>
          </div>
        ) : (
          <div className="mb-8">
            <Badge variant="outline" className="mb-4">
              {currentRole === "bookkeeper" ? "Bookkeeper View" : "Expense Classifier View"}
            </Badge>
            
            {currentRole === "bookkeeper" ? (
              <div className="space-y-8">
                <ImportSection
                  importedExpenses={importedExpenses}
                  accountCodes={accountCodes}
                  onExpensesUploaded={handleExpensesUploaded}
                  onDeleteImportedExpense={handleDeleteImportedExpense}
                  onBulkDeleteImportedExpenses={handleBulkDeleteImportedExpenses}
                  onSaveImportedExpenses={handleSaveImportedExpenses}
                  onClearImportedExpenses={handleClearImportedExpenses}
                  isSaving={addExpenses.isPending}
                />
                
                <BookkeeperDashboard
                  expenses={expenses}
                  accountCodes={accountCodes}
                  unclassifiedExpenses={unclassifiedExpenses}
                  onDeleteUnclassifiedExpense={handleDeleteUnclassifiedExpense}
                  onBulkDeleteUnclassifiedExpenses={handleBulkDeleteUnclassifiedExpenses}
                />
              </div>
            ) : (
              <ClassifierView
                unclassifiedExpenses={unclassifiedExpenses}
                classifiedExpenses={classifiedExpenses}
                accountCodes={accountCodes}
                onExpenseClassified={handleExpenseClassified}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;


import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { MainContent } from "@/components/MainContent";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useImportedExpenses } from "@/hooks/useImportedExpenses";
import { useExpenseOperations } from "@/hooks/useExpenseOperations";

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
  
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: accountCodes = [], isLoading: accountCodesLoading } = useCategories();
  
  const {
    importedExpenses,
    setImportedExpenses,
    handleExpensesUploaded,
    handleDeleteImportedExpense,
    handleBulkDeleteImportedExpenses,
    handleClearImportedExpenses,
  } = useImportedExpenses();

  const {
    handleExpenseClassified,
    handleDeleteUnclassifiedExpense,
    handleBulkDeleteUnclassifiedExpenses,
  } = useExpenseOperations();

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
          <MainContent
            currentRole={currentRole}
            expenses={expenses}
            accountCodes={accountCodes}
            importedExpenses={importedExpenses}
            onExpensesUploaded={handleExpensesUploaded}
            onDeleteImportedExpense={handleDeleteImportedExpense}
            onBulkDeleteImportedExpenses={handleBulkDeleteImportedExpenses}
            onClearImportedExpenses={handleClearImportedExpenses}
            setImportedExpenses={setImportedExpenses}
            onExpenseClassified={handleExpenseClassified}
            onDeleteUnclassifiedExpense={handleDeleteUnclassifiedExpense}
            onBulkDeleteUnclassifiedExpenses={handleBulkDeleteUnclassifiedExpenses}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

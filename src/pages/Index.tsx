import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, User, Loader2, Settings, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "@/components/FileUpload";
import { ExpenseClassifier } from "@/components/ExpenseClassifier";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";
import { ExpensesTable } from "@/components/ExpensesTable";
import { useExpenses, useAddExpenses, useClassifyExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { useAccountCodes } from "@/hooks/useAccountCodes";
import { toast } from "@/hooks/use-toast";

export type UserRole = "bookkeeper" | "classifier";

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  spent: number;
  accountCode?: string;
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
  const navigate = useNavigate();
  
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: accountCodes = [], isLoading: accountCodesLoading } = useAccountCodes();
  const addExpenses = useAddExpenses();
  const classifyExpense = useClassifyExpense();
  const deleteExpense = useDeleteExpense();

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
    const selectedAccountCode = accountCodes.find(ac => ac.code === accountCode);
    if (!selectedAccountCode) {
      toast({
        title: "Error",
        description: "Invalid account code selected",
        variant: "destructive",
      });
      return;
    }

    try {
      await classifyExpense.mutateAsync({ 
        expenseId, 
        accountCodeId: selectedAccountCode.id 
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

  const unclassifiedExpenses = expenses.filter(e => !e.classified);
  const classifiedExpenses = expenses.filter(e => e.classified);

  const isLoading = expensesLoading || accountCodesLoading;

  console.log('Imported expenses state:', importedExpenses);
  console.log('Imported expenses count:', importedExpenses.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Expense Manager</h1>
              <p className="text-slate-600">Streamline your business expense classification</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/chart-of-accounts")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Chart of Accounts
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Current Role:</span>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={currentRole === "bookkeeper" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentRole("bookkeeper")}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Bookkeeper
                  </Button>
                  <Button
                    variant={currentRole === "classifier" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentRole("classifier")}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Classifier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900">Upload Expenses</h2>
                  <FileUpload onExpensesUploaded={handleExpensesUploaded} />
                </Card>

                {importedExpenses.length > 0 && (
                  <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-900">
                        Review Imported Expenses
                        <Badge variant="secondary" className="ml-2">
                          {importedExpenses.length} expenses
                        </Badge>
                      </h2>
                      <Button
                        onClick={handleSaveImportedExpenses}
                        disabled={addExpenses.isPending}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {addExpenses.isPending ? "Saving..." : "Save to Database"}
                      </Button>
                    </div>
                    <ExpensesTable 
                      expenses={importedExpenses}
                      accountCodes={accountCodes}
                      title=""
                      showClassificationStatus={false}
                      showDeleteButton={true}
                      onDeleteExpense={handleDeleteImportedExpense}
                    />
                  </Card>
                )}

                <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900">Expenses Overview</h2>
                  <ExpensesDashboard 
                    expenses={expenses}
                    accountCodes={accountCodes}
                  />
                </Card>
              </div>
            ) : (
              <div className="space-y-8">
                <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900">
                    Classify Expenses 
                    <Badge variant="secondary" className="ml-2">
                      {unclassifiedExpenses.length} pending
                    </Badge>
                  </h2>
                  <ExpenseClassifier
                    expenses={unclassifiedExpenses}
                    accountCodes={accountCodes}
                    onExpenseClassified={handleExpenseClassified}
                    onExpenseDeleted={handleDeleteUnclassifiedExpense}
                  />
                </Card>

                {classifiedExpenses.length > 0 && (
                  <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-900">Classified Expenses</h2>
                    <ExpensesDashboard 
                      expenses={classifiedExpenses}
                      accountCodes={accountCodes}
                    />
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

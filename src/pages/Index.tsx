
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { ExpenseClassifier } from "@/components/ExpenseClassifier";
import { ChartOfAccounts } from "@/components/ChartOfAccounts";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";

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
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
}

const Index = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("bookkeeper");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accountCodes, setAccountCodes] = useState<AccountCode[]>([
    { id: "1", code: "6000", name: "Office Supplies", type: "expense" },
    { id: "2", code: "6100", name: "Travel & Entertainment", type: "expense" },
    { id: "3", code: "6200", name: "Professional Services", type: "expense" },
    { id: "4", code: "6300", name: "Marketing & Advertising", type: "expense" },
    { id: "5", code: "6400", name: "Utilities", type: "expense" },
  ]);

  const handleExpensesUploaded = (newExpenses: Expense[]) => {
    setExpenses(prev => [...prev, ...newExpenses]);
  };

  const handleExpenseClassified = (expenseId: string, accountCode: string) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, accountCode, classified: true }
          : expense
      )
    );
  };

  const handleAccountCodesUpdate = (updatedCodes: AccountCode[]) => {
    setAccountCodes(updatedCodes);
  };

  const unclassifiedExpenses = expenses.filter(e => !e.classified);
  const classifiedExpenses = expenses.filter(e => e.classified);

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
            
            {/* Role Switch */}
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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

              <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Chart of Accounts</h2>
                <ChartOfAccounts 
                  accountCodes={accountCodes}
                  onAccountCodesUpdate={handleAccountCodesUpdate}
                />
              </Card>

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
      </main>
    </div>
  );
};

export default Index;

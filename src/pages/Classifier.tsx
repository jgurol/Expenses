
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExpenseClassifier } from "@/components/ExpenseClassifier";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useSources } from "@/hooks/useSources";
import { useExpenseOperations } from "@/hooks/useExpenseOperations";
import { useAuth } from "@/hooks/useAuth";

const Classifier = () => {
  const navigate = useNavigate();
  const { isClassifier, isAdmin } = useAuth();
  
  const { data: expenses = [] } = useExpenses();
  const { data: accountCodes = [] } = useCategories();
  const { data: sources = [] } = useSources();
  
  const {
    handleExpenseClassified,
    handleDeleteUnclassifiedExpense,
  } = useExpenseOperations();

  // Only allow classifiers and admins to access this view
  if (!isClassifier && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Expense Classifier</h1>
                  <p className="text-slate-600">Classify expenses by account codes</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
              <p className="text-slate-600">You don't have permission to classify expenses.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const unclassifiedExpenses = expenses.filter(e => !e.classified);
  const classifiedExpenses = expenses.filter(e => e.classified);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Expense Classifier</h1>
                <p className="text-slate-600">Classify expenses by account codes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                {unclassifiedExpenses.length} pending classification
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
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
              sources={sources}
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
      </main>
    </div>
  );
};

export default Classifier;

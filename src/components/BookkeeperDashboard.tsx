import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileCheck, Receipt, Archive, ArrowRight } from "lucide-react";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";
import { useArchivedExpenses } from "@/hooks/useArchivedExpenses";
import type { Expense, AccountCode } from "@/pages/Index";

interface BookkeeperDashboardProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
  unclassifiedExpenses: Expense[];
  onDeleteUnclassifiedExpense: (expenseId: string) => void;
  onBulkDeleteUnclassifiedExpenses: (expenseIds: string[]) => void;
}

export const BookkeeperDashboard = ({
  expenses,
  accountCodes,
  unclassifiedExpenses,
  onDeleteUnclassifiedExpense,
  onBulkDeleteUnclassifiedExpenses
}: BookkeeperDashboardProps) => {
  const { data: archivedExpenses = [] } = useArchivedExpenses();
  
  // Calculate workflow stage statistics
  const classifiedExpenses = expenses.filter(e => e.classified && !e.reconciled);
  const reconciledExpenses = expenses.filter(e => e.reconciled);
  
  const unclassifiedAmount = unclassifiedExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const classifiedAmount = classifiedExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const reconciledAmount = reconciledExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const archivedAmount = archivedExpenses.reduce((sum, expense) => sum + expense.spent, 0);

  // Calculate total expenses statistics
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.spent, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
        <h2 className="text-xl font-semibold mb-6 text-slate-900">Expense Workflow Summary</h2>
        
        {/* Workflow Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-4 border-orange-200 bg-orange-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileCheck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Unclassified</h3>
                <p className="text-xs text-slate-500">Awaiting classification</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">{unclassifiedExpenses.length}</div>
              <div className="text-sm text-slate-600">${unclassifiedAmount.toFixed(2)}</div>
            </div>
          </Card>

          {/* Arrow 1: Unclassified → Classified */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-slate-400" />
          </div>
          
          <Card className="p-4 border-blue-200 bg-blue-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">To Be Reconciled</h3>
                <p className="text-xs text-slate-500">Classified, awaiting reconciliation</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">{classifiedExpenses.length}</div>
              <div className="text-sm text-slate-600">${classifiedAmount.toFixed(2)}</div>
            </div>
          </Card>

          {/* Arrow 2: Classified → Reconciled */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-slate-400" />
          </div>
          
          <Card className="p-4 border-green-200 bg-green-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Reconciled</h3>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{reconciledExpenses.length}</div>
              <div className="text-sm text-slate-600">${reconciledAmount.toFixed(2)}</div>
            </div>
          </Card>
        </div>

        {/* Additional Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Receipt className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Total Expenses</h3>
                <p className="text-xs text-slate-500">All expenses overview</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-600">{expenses.length}</div>
              <div className="text-sm text-slate-600">${totalAmount.toFixed(2)}</div>
            </div>
          </Card>

          {/* Arrow 3: Total → Archived */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-slate-400" />
          </div>

          <Card className="p-4 border-purple-200 bg-purple-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Archive className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Archived</h3>
                <p className="text-xs text-slate-500">Historical expenses</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">{archivedExpenses.length}</div>
              <div className="text-sm text-slate-600">${archivedAmount.toFixed(2)}</div>
            </div>
          </Card>
        </div>
      </Card>

      <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
        <ExpensesDashboard 
          expenses={expenses}
          accountCodes={accountCodes}
          onDeleteExpense={onDeleteUnclassifiedExpense}
          onBulkDeleteExpenses={onBulkDeleteUnclassifiedExpenses}
        />
      </Card>
    </div>
  );
};

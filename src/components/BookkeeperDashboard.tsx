
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileCheck, Archive, ArrowRight } from "lucide-react";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";
import { useArchivedExpenses } from "@/hooks/useArchivedExpenses";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/formatUtils";
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
  const navigate = useNavigate();
  
  // Calculate workflow stage statistics
  const classifiedExpenses = expenses.filter(e => e.classified && !e.reconciled);
  const reconciledExpenses = expenses.filter(e => e.reconciled);
  
  const unclassifiedAmount = unclassifiedExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const classifiedAmount = classifiedExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const reconciledAmount = reconciledExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const archivedAmount = archivedExpenses.reduce((sum, expense) => sum + expense.spent, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
        <h2 className="text-xl font-semibold mb-6 text-slate-900">Expense Workflow Summary</h2>
        
        {/* Single horizontal line with all 4 cards */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {/* Unclassified */}
          <div className="flex-1 min-w-0">
            <Card 
              className="p-4 border-orange-200 bg-orange-50/50 h-full cursor-pointer hover:bg-orange-100/50 transition-colors"
              onClick={() => navigate('/classifier')}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileCheck className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-600">Unclassified</h3>
                  <p className="text-xs text-slate-500">Awaiting classification</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-orange-600">{unclassifiedExpenses.length}</div>
                <div className="text-xs text-slate-600">{formatCurrency(unclassifiedAmount)}</div>
                <div className="text-xs text-orange-600 font-medium">Click here</div>
              </div>
            </Card>
          </div>

          {/* Arrow 1 */}
          <div className="flex-shrink-0">
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>
          
          {/* To Be Reconciled */}
          <div className="flex-1 min-w-0">
            <Card 
              className="p-4 border-blue-200 bg-blue-50/50 h-full cursor-pointer hover:bg-blue-100/50 transition-colors"
              onClick={() => navigate('/reconcile')}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-600">To Be Reconciled</h3>
                  <p className="text-xs text-slate-500">Classified, awaiting reconciliation</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-blue-600">{classifiedExpenses.length}</div>
                <div className="text-xs text-slate-600">{formatCurrency(classifiedAmount)}</div>
                <div className="text-xs text-blue-600 font-medium">Click here</div>
              </div>
            </Card>
          </div>

          {/* Arrow 2 */}
          <div className="flex-shrink-0">
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>
          
          {/* Reconciled */}
          <div className="flex-1 min-w-0">
            <Card 
              className="p-4 border-green-200 bg-green-50/50 h-full cursor-pointer hover:bg-green-100/50 transition-colors"
              onClick={() => navigate('/reconciled')}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-600">Reconciled</h3>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-green-600">{reconciledExpenses.length}</div>
                <div className="text-xs text-slate-600">{formatCurrency(reconciledAmount)}</div>
                <div className="text-xs text-green-600 font-medium">Click here</div>
              </div>
            </Card>
          </div>

          {/* Arrow 3 */}
          <div className="flex-shrink-0">
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>
          
          {/* Archived */}
          <div className="flex-1 min-w-0">
            <Card 
              className="p-4 border-purple-200 bg-purple-50/50 h-full cursor-pointer hover:bg-purple-100/50 transition-colors"
              onClick={() => navigate('/archived')}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Archive className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-600">Archived</h3>
                  <p className="text-xs text-slate-500">Historical expenses</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-purple-600">{archivedExpenses.length}</div>
                <div className="text-xs text-slate-600">{formatCurrency(archivedAmount)}</div>
                <div className="text-xs text-purple-600 font-medium">Click here</div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <ExpensesDashboard 
        expenses={expenses}
        accountCodes={accountCodes}
        onDeleteExpense={onDeleteUnclassifiedExpense}
        onBulkDeleteExpenses={onBulkDeleteUnclassifiedExpenses}
      />
    </div>
  );
};

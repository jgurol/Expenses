
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpensesTable } from "@/components/ExpensesTable";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpensesDashboardProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
  onDeleteExpense?: (expenseId: string) => void;
  onBulkDeleteExpenses?: (expenseIds: string[]) => void;
}

export const ExpensesDashboard = memo(({ 
  expenses, 
  accountCodes,
  onDeleteExpense,
  onBulkDeleteExpenses
}: ExpensesDashboardProps) => {
  const classifiedExpenses = expenses.filter(e => e.classified);
  const unclassifiedExpenses = expenses.filter(e => !e.classified);
  
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.spent, 0);
  const classifiedAmount = classifiedExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const unclassifiedAmount = unclassifiedExpenses.reduce((sum, expense) => sum + expense.spent, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Expenses</h3>
          <div className="text-2xl font-bold text-slate-900">{expenses.length}</div>
          <div className="text-sm text-slate-500">${totalAmount.toFixed(2)}</div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Classified</h3>
          <div className="text-2xl font-bold text-green-600">{classifiedExpenses.length}</div>
          <div className="text-sm text-slate-500">${classifiedAmount.toFixed(2)}</div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Unclassified</h3>
          <div className="text-2xl font-bold text-orange-600">{unclassifiedExpenses.length}</div>
          <div className="text-sm text-slate-500">${unclassifiedAmount.toFixed(2)}</div>
        </Card>
      </div>

      {/* Only show unclassified expenses on the main dashboard */}
      {unclassifiedExpenses.length > 0 && (
        <ExpensesTable 
          expenses={unclassifiedExpenses}
          accountCodes={accountCodes}
          title="Unclassified Expenses"
          showClassificationStatus={true}
          showDeleteButton={true}
          showMultiSelect={true}
          onDeleteExpense={onDeleteExpense}
          onBulkDeleteExpenses={onBulkDeleteExpenses}
        />
      )}
    </div>
  );
});

ExpensesDashboard.displayName = 'ExpensesDashboard';

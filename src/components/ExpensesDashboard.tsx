
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

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Expenses Overview</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
          <span className="font-medium">{expenses.length} Total Expenses</span>
          <span>•</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
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

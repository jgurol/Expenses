
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
  const unclassifiedExpenses = expenses.filter(e => !e.classified);

  return (
    <div className="space-y-6">
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

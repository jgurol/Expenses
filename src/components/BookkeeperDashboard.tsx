
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";
import { ExpensesTable } from "@/components/ExpensesTable";
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
  return (
    <div className="space-y-8">
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Expenses Overview</h2>
        <ExpensesDashboard 
          expenses={expenses}
          accountCodes={accountCodes}
          onDeleteExpense={onDeleteUnclassifiedExpense}
          onBulkDeleteExpenses={onBulkDeleteUnclassifiedExpenses}
        />
      </Card>

      {unclassifiedExpenses.length > 0 && (
        <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">
            Unclassified Expenses
            <Badge variant="secondary" className="ml-2">
              {unclassifiedExpenses.length} pending
            </Badge>
          </h2>
          <ExpensesTable 
            expenses={unclassifiedExpenses}
            accountCodes={accountCodes}
            title=""
            showClassificationStatus={true}
            showDeleteButton={true}
            showMultiSelect={true}
            onDeleteExpense={onDeleteUnclassifiedExpense}
            onBulkDeleteExpenses={onBulkDeleteUnclassifiedExpenses}
          />
        </Card>
      )}
    </div>
  );
};

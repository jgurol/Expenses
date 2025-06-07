
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseClassifier } from "@/components/ExpenseClassifier";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";
import type { Expense, AccountCode } from "@/pages/Index";

interface ClassifierViewProps {
  unclassifiedExpenses: Expense[];
  classifiedExpenses: Expense[];
  accountCodes: AccountCode[];
  onExpenseClassified: (expenseId: string, accountCode: string) => void;
  onExpenseDeleted: (expenseId: string) => void;
}

export const ClassifierView = ({
  unclassifiedExpenses,
  classifiedExpenses,
  accountCodes,
  onExpenseClassified,
  onExpenseDeleted
}: ClassifierViewProps) => {
  return (
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
          onExpenseClassified={onExpenseClassified}
          onExpenseDeleted={onExpenseDeleted}
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
  );
};

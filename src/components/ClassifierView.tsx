
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseClassifier } from "@/components/ExpenseClassifier";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useSources } from "@/hooks/useSources";
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
  const { isClassifier, isAdmin } = useAuth();
  const { data: sources = [] } = useSources();

  // Only allow classifiers and admins to access this view
  if (!isClassifier && !isAdmin) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to classify expenses.</p>
        </div>
      </div>
    );
  }

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
          sources={sources}
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

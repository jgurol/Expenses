
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { ExpensesTable } from "./ExpensesTable";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpenseClassifierProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
  onExpenseClassified: (expenseId: string, accountCode: string) => void;
  onExpenseDeleted?: (expenseId: string) => void;
}

export const ExpenseClassifier = ({ 
  expenses, 
  accountCodes, 
  onExpenseClassified,
  onExpenseDeleted 
}: ExpenseClassifierProps) => {
  const [selectedAccountCodes, setSelectedAccountCodes] = useState<Record<string, string>>({});

  const handleClassifyExpense = (expenseId: string) => {
    const accountCode = selectedAccountCodes[expenseId];
    if (accountCode) {
      onExpenseClassified(expenseId, accountCode);
      // Remove from selected after classification
      setSelectedAccountCodes(prev => {
        const updated = { ...prev };
        delete updated[expenseId];
        return updated;
      });
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (onExpenseDeleted) {
      onExpenseDeleted(expenseId);
      // Remove from selected after deletion
      setSelectedAccountCodes(prev => {
        const updated = { ...prev };
        delete updated[expenseId];
        return updated;
      });
    }
  };

  const handleAccountCodeSelect = (expenseId: string, accountCode: string) => {
    setSelectedAccountCodes(prev => ({
      ...prev,
      [expenseId]: accountCode
    }));
  };

  if (expenses.length === 0) {
    return <ExpensesTable expenses={expenses} accountCodes={accountCodes} showClassificationStatus={false} />;
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div>
                <p className="text-sm text-slate-600">Account</p>
                <Badge variant="outline" className="text-xs font-mono">
                  {expense.accountCode || "Unassigned"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600">Date</p>
                <p className="font-medium">{new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Description</p>
                <p className="font-medium">{expense.description}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Category</p>
                <p className="font-medium">{expense.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Amount</p>
                <p className="font-semibold text-green-600">${expense.spent.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <Select
              value={selectedAccountCodes[expense.id] || ""}
              onValueChange={(value) => handleAccountCodeSelect(expense.id, value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select account code" />
              </SelectTrigger>
              <SelectContent>
                {accountCodes.map((code) => (
                  <SelectItem key={code.id} value={code.code}>
                    {code.code} - {code.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => handleClassifyExpense(expense.id)}
              disabled={!selectedAccountCodes[expense.id]}
              size="sm"
            >
              Classify
            </Button>

            {onExpenseDeleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteExpense(expense.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

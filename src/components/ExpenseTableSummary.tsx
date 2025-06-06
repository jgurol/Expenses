
import type { Expense } from "@/pages/Index";

interface ExpenseTableSummaryProps {
  expenses: Expense[];
}

export const ExpenseTableSummary = ({ expenses }: ExpenseTableSummaryProps) => {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.spent, 0);

  return (
    <div className="mt-4 flex justify-between items-center text-sm text-slate-600 border-t pt-4">
      <span>Total: {expenses.length} expenses</span>
      <span className="font-semibold">
        Total Amount: ${totalAmount.toFixed(2)}
      </span>
    </div>
  );
};

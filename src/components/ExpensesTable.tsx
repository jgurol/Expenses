import { useState, memo, useMemo } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ExpenseTableEmpty } from "./ExpenseTableEmpty";
import { ExpenseTableHeader } from "./ExpenseTableHeader";
import { ExpenseTableRow } from "./ExpenseTableRow";
import { ExpenseTableSummary } from "./ExpenseTableSummary";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpensesTableProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
  title?: string;
  showClassificationStatus?: boolean;
  onDeleteExpense?: (expenseId: string) => void;
  onBulkDeleteExpenses?: (expenseIds: string[]) => void;
  showDeleteButton?: boolean;
  showMultiSelect?: boolean;
}

export const ExpensesTable = memo(({ 
  expenses, 
  accountCodes, 
  title = "Expenses",
  showClassificationStatus = true,
  onDeleteExpense,
  onBulkDeleteExpenses,
  showDeleteButton = false,
  showMultiSelect = false
}: ExpensesTableProps) => {
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  // Memoize expensive calculations
  const isAllSelected = useMemo(() => selectedExpenses.length === expenses.length, [selectedExpenses.length, expenses.length]);
  const isSomeSelected = useMemo(() => selectedExpenses.length > 0 && selectedExpenses.length < expenses.length, [selectedExpenses.length, expenses.length]);

  console.log('ExpensesTable rendered with:', { 
    expensesCount: expenses.length, 
    showDeleteButton, 
    showMultiSelect,
    hasOnDeleteExpense: !!onDeleteExpense,
    hasOnBulkDeleteExpenses: !!onBulkDeleteExpenses,
    title 
  });

  if (expenses.length === 0) {
    return <ExpenseTableEmpty />;
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(expenses.map(expense => expense.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSelectExpense = (expenseId: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses(prev => [...prev, expenseId]);
    } else {
      setSelectedExpenses(prev => prev.filter(id => id !== expenseId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedExpenses.length > 0 && onBulkDeleteExpenses) {
      onBulkDeleteExpenses(selectedExpenses);
      setSelectedExpenses([]);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {showMultiSelect && selectedExpenses.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedExpenses.length})
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <ExpenseTableHeader
            showMultiSelect={showMultiSelect}
            showClassificationStatus={showClassificationStatus}
            showDeleteButton={showDeleteButton}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onSelectAll={handleSelectAll}
          />
          <TableBody>
            {expenses.map((expense) => {
              const isSelected = selectedExpenses.includes(expense.id);
              return (
                <ExpenseTableRow
                  key={expense.id}
                  expense={expense}
                  accountCodes={accountCodes}
                  showMultiSelect={showMultiSelect}
                  showClassificationStatus={showClassificationStatus}
                  showDeleteButton={showDeleteButton}
                  isSelected={isSelected}
                  onSelectExpense={handleSelectExpense}
                  onDeleteExpense={onDeleteExpense}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <ExpenseTableSummary expenses={expenses} />
    </Card>
  );
});

ExpensesTable.displayName = 'ExpensesTable';

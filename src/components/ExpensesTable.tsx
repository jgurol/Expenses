
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Trash2 } from "lucide-react";
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

export const ExpensesTable = ({ 
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

  console.log('ExpensesTable rendered with:', { 
    expensesCount: expenses.length, 
    showDeleteButton, 
    showMultiSelect,
    hasOnDeleteExpense: !!onDeleteExpense,
    hasOnBulkDeleteExpenses: !!onBulkDeleteExpenses,
    title 
  });

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center bg-slate-50">
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">No expenses to display</h3>
        <p className="text-slate-500">Expenses will appear here once they are uploaded</p>
      </Card>
    );
  }

  const getAccountName = (accountCodeId?: string) => {
    if (!accountCodeId) return "Unassigned";
    const account = accountCodes.find(code => code.id === accountCodeId);
    return account ? `${account.code} - ${account.name}` : accountCodeId;
  };

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

  const isAllSelected = selectedExpenses.length === expenses.length;
  const isSomeSelected = selectedExpenses.length > 0 && selectedExpenses.length < expenses.length;

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
          <TableHeader>
            <TableRow>
              {showMultiSelect && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected || isSomeSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all expenses"
                  />
                </TableHead>
              )}
              <TableHead>Account</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {showClassificationStatus && <TableHead className="text-center">Status</TableHead>}
              {showDeleteButton && <TableHead className="text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const isSelected = selectedExpenses.includes(expense.id);
              console.log('Rendering expense row:', expense.id, 'showDeleteButton:', showDeleteButton);
              return (
                <TableRow key={expense.id} className="hover:bg-slate-50">
                  {showMultiSelect && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectExpense(expense.id, checked as boolean)}
                        aria-label={`Select expense ${expense.description}`}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {expense.accountCode || getAccountName(expense.accountCode)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${expense.spent.toFixed(2)}
                  </TableCell>
                  {showClassificationStatus && (
                    <TableCell className="text-center">
                      <Badge 
                        variant={expense.classified ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {expense.classified ? "Classified" : "Pending"}
                      </Badge>
                    </TableCell>
                  )}
                  {showDeleteButton && (
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log('Delete button clicked for expense:', expense.id);
                          if (onDeleteExpense) {
                            onDeleteExpense(expense.id);
                          } else {
                            console.warn('onDeleteExpense function not provided');
                          }
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-slate-600 border-t pt-4">
        <span>Total: {expenses.length} expenses</span>
        <span className="font-semibold">
          Total Amount: ${expenses.reduce((sum, expense) => sum + expense.spent, 0).toFixed(2)}
        </span>
      </div>
    </Card>
  );
};

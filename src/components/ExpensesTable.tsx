
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpensesTableProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
  title?: string;
  showClassificationStatus?: boolean;
  onDeleteExpense?: (expenseId: string) => void;
  showDeleteButton?: boolean;
}

export const ExpensesTable = ({ 
  expenses, 
  accountCodes, 
  title = "Expenses",
  showClassificationStatus = true,
  onDeleteExpense,
  showDeleteButton = false
}: ExpensesTableProps) => {
  console.log('ExpensesTable props:', { 
    expensesCount: expenses.length, 
    showDeleteButton, 
    hasOnDeleteExpense: !!onDeleteExpense 
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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">{title}</h3>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
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
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-slate-50">
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
                        onDeleteExpense?.(expense.id);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary row */}
      <div className="mt-4 flex justify-between items-center text-sm text-slate-600 border-t pt-4">
        <span>Total: {expenses.length} expenses</span>
        <span className="font-semibold">
          Total Amount: ${expenses.reduce((sum, expense) => sum + expense.spent, 0).toFixed(2)}
        </span>
      </div>
    </Card>
  );
};

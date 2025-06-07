
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpenseTableRowProps {
  expense: Expense;
  accountCodes: AccountCode[];
  showMultiSelect: boolean;
  showClassificationStatus: boolean;
  showDeleteButton: boolean;
  isSelected: boolean;
  onSelectExpense: (expenseId: string, checked: boolean) => void;
  onDeleteExpense?: (expenseId: string) => void;
}

export const ExpenseTableRow = ({
  expense,
  accountCodes,
  showMultiSelect,
  showClassificationStatus,
  showDeleteButton,
  isSelected,
  onSelectExpense,
  onDeleteExpense
}: ExpenseTableRowProps) => {
  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    onSelectExpense(expense.id, checked === true);
  };

  console.log('Rendering expense row:', expense.id, 'showDeleteButton:', showDeleteButton, 'showMultiSelect:', showMultiSelect, 'isSelected:', isSelected);

  return (
    <TableRow className="hover:bg-slate-50">
      {showMultiSelect && (
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Select expense ${expense.description}`}
          />
        </TableCell>
      )}
      <TableCell>
        <Badge variant="outline" className="text-xs font-mono">
          {expense.sourceAccount || "Unknown"}
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
};

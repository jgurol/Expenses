
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatUtils";
import { useUpdateExpenseCategory } from "@/hooks/useUpdateExpenseCategory";
import { toast } from "@/hooks/use-toast";
import type { Expense, AccountCode } from "@/pages/Index";
import type { Source } from "@/hooks/useSources";

interface ExpenseTableRowProps {
  expense: Expense;
  accountCodes: AccountCode[];
  sources?: Source[];
  showMultiSelect: boolean;
  showClassificationStatus: boolean;
  showDeleteButton: boolean;
  showCodeColumn?: boolean;
  isSelected: boolean;
  onSelectExpense: (expenseId: string, checked: boolean) => void;
  onDeleteExpense?: (expenseId: string) => void;
  allowCategoryChange?: boolean;
}

export const ExpenseTableRow = ({
  expense,
  accountCodes,
  sources = [],
  showMultiSelect,
  showClassificationStatus,
  showDeleteButton,
  showCodeColumn = false,
  isSelected,
  onSelectExpense,
  onDeleteExpense,
  allowCategoryChange = false
}: ExpenseTableRowProps) => {
  const updateCategoryMutation = useUpdateExpenseCategory();

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    onSelectExpense(expense.id, checked === true);
  };

  const handleCategoryChange = async (categoryName: string) => {
    const category = accountCodes.find(code => code.name === categoryName);
    if (!category) return;

    try {
      await updateCategoryMutation.mutateAsync({
        expenseId: expense.id,
        categoryName: category.name,
        categoryId: category.id
      });
      
      toast({
        title: "Category Updated",
        description: `Expense category changed to ${category.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Display the full source account name without any parsing
  const getSourceAccountName = (sourceAccount: string) => {
    return sourceAccount || "Unknown";
  };

  // Get source description by matching account name or account number
  const getSourceDescription = (sourceAccount: string) => {
    if (!sourceAccount || sources.length === 0) return null;
    
    // Try to find source by name first, then by account number
    const source = sources.find(s => 
      s.name === sourceAccount || 
      s.account_number === sourceAccount
    );
    
    return source?.description || null;
  };

  // Get the account code for this expense's category
  const getAccountCode = (categoryName: string) => {
    const accountCode = accountCodes.find(code => code.name === categoryName);
    return accountCode?.code || "N/A";
  };

  // Generate consistent color based on source account
  const getAccountColor = (sourceAccount: string) => {
    const account = sourceAccount || "Unknown";
    const colors = [
      "bg-blue-50 hover:bg-blue-100",
      "bg-green-50 hover:bg-green-100", 
      "bg-purple-50 hover:bg-purple-100",
      "bg-orange-50 hover:bg-orange-100",
      "bg-pink-50 hover:bg-pink-100",
      "bg-cyan-50 hover:bg-cyan-100",
      "bg-yellow-50 hover:bg-yellow-100",
      "bg-indigo-50 hover:bg-indigo-100",
      "bg-red-50 hover:bg-red-100",
      "bg-teal-50 hover:bg-teal-100"
    ];
    
    // Generate a consistent hash from the account name
    let hash = 0;
    for (let i = 0; i < account.length; i++) {
      const char = account.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const sourceDescription = getSourceDescription(expense.sourceAccount);

  console.log('Rendering expense row:', expense.id, 'showDeleteButton:', showDeleteButton, 'showMultiSelect:', showMultiSelect, 'showCodeColumn:', showCodeColumn, 'isSelected:', isSelected);

  return (
    <TableRow className={getAccountColor(expense.sourceAccount)}>
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
        <div>
          <Badge variant="outline" className="text-xs font-mono">
            {getSourceAccountName(expense.sourceAccount || "Unknown")}
          </Badge>
          {sourceDescription && (
            <div className="text-xs text-slate-500 mt-1">
              {sourceDescription}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">
        {new Date(expense.date).toLocaleDateString()}
      </TableCell>
      <TableCell className="font-medium">
        {expense.description}
      </TableCell>
      {showCodeColumn && (
        <TableCell>
          <Badge variant="outline" className="text-xs font-mono">
            {getAccountCode(expense.category)}
          </Badge>
        </TableCell>
      )}
      <TableCell>
        {allowCategoryChange && expense.classified && !expense.reconciled ? (
          <Select value={expense.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accountCodes.map((code) => (
                <SelectItem key={code.id} value={code.name}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{code.code}</span>
                    <span>{code.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline" className="text-xs">
            {expense.category}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right font-semibold">
        {formatCurrency(expense.spent)}
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

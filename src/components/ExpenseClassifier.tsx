
import { useState, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, CheckSquare } from "lucide-react";
import { ExpensesTable } from "./ExpensesTable";
import type { Expense, AccountCode } from "@/pages/Index";

type SortField = 'sourceAccount' | 'date' | 'category';
type SortDirection = 'asc' | 'desc';

interface ExpenseClassifierProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
  onExpenseClassified: (expenseId: string, accountCode: string) => void;
}

export const ExpenseClassifier = memo(({ 
  expenses, 
  accountCodes, 
  onExpenseClassified
}: ExpenseClassifierProps) => {
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort expenses based on current sort field and direction
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'sourceAccount':
          aValue = a.sourceAccount || 'Unknown';
          bValue = b.sourceAccount || 'Unknown';
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [expenses, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get the formatted category text with code and name
  const getCategoryDisplayText = (category: string) => {
    const trimmedCategory = category.trim();
    
    // Find account code that matches the current category name
    const matchingAccountCode = accountCodes.find(ac => 
      ac.name.toLowerCase().includes(trimmedCategory.toLowerCase()) ||
      trimmedCategory.toLowerCase().includes(ac.name.toLowerCase()) ||
      ac.code.toLowerCase() === trimmedCategory.toLowerCase()
    );
    
    if (matchingAccountCode) {
      return `${matchingAccountCode.code.trim()} - ${matchingAccountCode.name.trim()}`;
    }
    
    // If no match found, just return the original category trimmed
    return trimmedCategory;
  };

  const handleSelectExpense = (expenseId: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses(prev => [...prev, expenseId]);
    } else {
      setSelectedExpenses(prev => prev.filter(id => id !== expenseId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(sortedExpenses.map(e => e.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleBulkAcceptCategories = () => {
    selectedExpenses.forEach(expenseId => {
      const expense = sortedExpenses.find(e => e.id === expenseId);
      if (expense) {
        // Find account code that matches the current category name
        const matchingAccountCode = accountCodes.find(ac => 
          ac.name.toLowerCase().includes(expense.category.toLowerCase()) ||
          expense.category.toLowerCase().includes(ac.name.toLowerCase()) ||
          ac.code.toLowerCase() === expense.category.toLowerCase()
        );
        
        if (matchingAccountCode) {
          onExpenseClassified(expenseId, matchingAccountCode.code);
        } else {
          // If no exact match, use the first available expense account code
          const defaultAccountCode = accountCodes.find(ac => ac.type === 'expense') || accountCodes[0];
          if (defaultAccountCode) {
            onExpenseClassified(expenseId, defaultAccountCode.code);
          }
        }
      }
    });
    setSelectedExpenses([]);
  };

  const handleAcceptCategory = (expenseId: string) => {
    const expense = sortedExpenses.find(e => e.id === expenseId);
    console.log('Accepting current category for expense:', { expenseId, expense });
    
    if (expense) {
      // Find account code that matches the current category name
      const matchingAccountCode = accountCodes.find(ac => 
        ac.name.toLowerCase().includes(expense.category.toLowerCase()) ||
        expense.category.toLowerCase().includes(ac.name.toLowerCase()) ||
        ac.code.toLowerCase() === expense.category.toLowerCase()
      );
      
      console.log('Found matching account code for category:', matchingAccountCode);
      
      if (matchingAccountCode) {
        // Accept the current category by assigning the matching account code
        onExpenseClassified(expenseId, matchingAccountCode.code);
      } else {
        // If no exact match, use the first available expense account code
        const defaultAccountCode = accountCodes.find(ac => ac.type === 'expense') || accountCodes[0];
        console.log('Using default account code for category:', defaultAccountCode);
        
        if (defaultAccountCode) {
          // Accept with the default account code
          onExpenseClassified(expenseId, defaultAccountCode.code);
        }
      }
    }
  };

  const handleAccountCodeSelect = (expenseId: string, accountCode: string) => {
    console.log('Account code selected - automatically reclassifying:', { expenseId, accountCode });
    // Automatically reclassify when dropdown selection changes
    onExpenseClassified(expenseId, accountCode);
  };

  if (expenses.length === 0) {
    return <ExpensesTable expenses={expenses} accountCodes={accountCodes} showClassificationStatus={false} />;
  }

  const isAllSelected = selectedExpenses.length === sortedExpenses.length;
  const isSomeSelected = selectedExpenses.length > 0 && selectedExpenses.length < sortedExpenses.length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Header */}
      <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg border">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) (el as any).indeterminate = isSomeSelected;
            }}
            onCheckedChange={handleSelectAll}
            aria-label="Select all expenses"
          />
          <span className="text-sm font-medium text-slate-700">
            {selectedExpenses.length > 0 
              ? `${selectedExpenses.length} expense${selectedExpenses.length === 1 ? '' : 's'} selected`
              : "Select expenses to accept categories in bulk"
            }
          </span>
        </div>
        
        {selectedExpenses.length > 0 && (
          <Button
            onClick={handleBulkAcceptCategories}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckSquare className="h-4 w-4" />
            Accept Selected ({selectedExpenses.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <ExpensesTable
          expenses={sortedExpenses}
          accountCodes={accountCodes}
          title=""
          showClassificationStatus={false}
          showDeleteButton={false}
          showMultiSelect={true}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          customRowRenderer={(expense, isSelected, onSelectExpense) => (
            <ClassifierTableRow
              key={expense.id}
              expense={expense}
              accountCodes={accountCodes}
              isSelected={isSelected}
              onSelectExpense={onSelectExpense}
              onAcceptCategory={handleAcceptCategory}
              onAccountCodeSelect={handleAccountCodeSelect}
              getCategoryDisplayText={getCategoryDisplayText}
            />
          )}
        />
      </div>
    </div>
  );
});

// Custom row component for the classifier table
interface ClassifierTableRowProps {
  expense: Expense;
  accountCodes: AccountCode[];
  isSelected: boolean;
  onSelectExpense: (expenseId: string, checked: boolean) => void;
  onAcceptCategory: (expenseId: string) => void;
  onAccountCodeSelect: (expenseId: string, accountCode: string) => void;
  getCategoryDisplayText: (category: string) => string;
}

const ClassifierTableRow = ({
  expense,
  accountCodes,
  isSelected,
  onSelectExpense,
  onAcceptCategory,
  onAccountCodeSelect,
  getCategoryDisplayText
}: ClassifierTableRowProps) => {
  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    onSelectExpense(expense.id, checked === true);
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

  return (
    <tr className={`border-b transition-colors ${getAccountColor(expense.sourceAccount)} ${isSelected ? 'ring-2 ring-blue-200' : ''}`}>
      <td className="p-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          aria-label={`Select expense ${expense.description}`}
        />
      </td>
      <td className="p-4">
        <Badge variant="outline" className="text-xs font-mono">
          {expense.sourceAccount || "Unknown"}
        </Badge>
      </td>
      <td className="p-4 font-mono text-sm">
        {new Date(expense.date).toLocaleDateString()}
      </td>
      <td className="p-4 font-medium">
        {expense.description}
      </td>
      <td className="p-4">
        <Badge variant="outline" className="text-xs">
          {expense.category}
        </Badge>
      </td>
      <td className="p-4 text-right font-semibold">
        ${expense.spent.toFixed(2)}
      </td>
      <td className="p-4">
        <Select
          value=""
          onValueChange={(value) => onAccountCodeSelect(expense.id, value)}
        >
          <SelectTrigger className="w-48 text-left">
            <SelectValue placeholder={getCategoryDisplayText(expense.category)} className="text-left" />
          </SelectTrigger>
          <SelectContent>
            {accountCodes.map((code) => (
              <SelectItem key={code.id} value={code.code}>
                {code.code} - {code.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-4">
        <Button
          onClick={() => onAcceptCategory(expense.id)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          title="Accept the current category and assign matching account code"
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
      </td>
    </tr>
  );
};

ExpenseClassifier.displayName = 'ExpenseClassifier';

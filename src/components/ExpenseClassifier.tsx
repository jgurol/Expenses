
import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Check, CheckSquare } from "lucide-react";
import { ExpensesTable } from "./ExpensesTable";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpenseClassifierProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
  onExpenseClassified: (expenseId: string, accountCode: string) => void;
  onExpenseDeleted?: (expenseId: string) => void;
}

export const ExpenseClassifier = memo(({ 
  expenses, 
  accountCodes, 
  onExpenseClassified,
  onExpenseDeleted 
}: ExpenseClassifierProps) => {
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  // Display the full source account name without any parsing
  const getAccountName = (sourceAccount: string) => {
    return sourceAccount || "Unknown";
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
      setSelectedExpenses(expenses.map(e => e.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleBulkAcceptCategories = () => {
    selectedExpenses.forEach(expenseId => {
      const expense = expenses.find(e => e.id === expenseId);
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
    const expense = expenses.find(e => e.id === expenseId);
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

  const handleDeleteExpense = (expenseId: string) => {
    if (onExpenseDeleted) {
      onExpenseDeleted(expenseId);
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

  const isAllSelected = selectedExpenses.length === expenses.length;
  const isSomeSelected = selectedExpenses.length > 0 && selectedExpenses.length < expenses.length;

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

      {/* Individual Expense Rows */}
      {expenses.map((expense) => {
        const isSelected = selectedExpenses.includes(expense.id);
        
        return (
          <div key={expense.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
            isSelected ? 'bg-blue-50 border-blue-200' : 'bg-slate-50'
          }`}>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectExpense(expense.id, checked === true)}
                aria-label={`Select expense ${expense.description}`}
              />
              
              <div className="flex-1">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-sm text-slate-600">Source Account</p>
                    <Badge variant="outline" className="text-xs font-mono">
                      {getAccountName(expense.sourceAccount || "Unknown")}
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
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Amount</p>
                    <p className="font-semibold text-green-600">${expense.spent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-6">
              <Select
                value=""
                onValueChange={(value) => handleAccountCodeSelect(expense.id, value)}
              >
                <SelectTrigger className="w-64 text-left">
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
              
              <Button
                onClick={() => handleAcceptCategory(expense.id)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                title="Accept the current category and assign matching account code"
              >
                <Check className="h-4 w-4" />
                Accept
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
        );
      })}
    </div>
  );
});

ExpenseClassifier.displayName = 'ExpenseClassifier';

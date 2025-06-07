
import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Check } from "lucide-react";
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
  // Display the full source account name without any parsing
  const getAccountName = (sourceAccount: string) => {
    return sourceAccount || "Unknown";
  };

  // Get the formatted category text with code and name
  const getCategoryDisplayText = (category: string) => {
    // Find account code that matches the current category name
    const matchingAccountCode = accountCodes.find(ac => 
      ac.name.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(ac.name.toLowerCase()) ||
      ac.code.toLowerCase() === category.toLowerCase()
    );
    
    if (matchingAccountCode) {
      return `${matchingAccountCode.code} - ${matchingAccountCode.name}`;
    }
    
    // If no match found, just return the original category
    return category;
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

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
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
              <div>
                <p className="text-sm text-slate-600">Amount</p>
                <p className="font-semibold text-green-600">${expense.spent.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <Select
              value=""
              onValueChange={(value) => handleAccountCodeSelect(expense.id, value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder={getCategoryDisplayText(expense.category)} />
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
      ))}
    </div>
  );
});

ExpenseClassifier.displayName = 'ExpenseClassifier';

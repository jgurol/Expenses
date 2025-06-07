
import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  const handleAccountCodeSelect = (expenseId: string, accountCode: string) => {
    console.log('Account code selected - automatically reclassifying:', { expenseId, accountCode });
    // Automatically reclassify when dropdown selection changes
    onExpenseClassified(expenseId, accountCode);
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

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No expenses to classify
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Source Account</TableHead>
            <TableHead className="w-24">Date</TableHead>
            <TableHead className="min-w-0 flex-1">Description</TableHead>
            <TableHead className="w-64">Assign Account Code</TableHead>
            <TableHead className="text-right w-24">Amount</TableHead>
            <TableHead className="text-center w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className={getAccountColor(expense.sourceAccount)}>
              <TableCell>
                <Badge variant="outline" className="text-xs font-mono">
                  {getAccountName(expense.sourceAccount || "Unknown")}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {new Date(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="font-medium">
                {expense.description}
              </TableCell>
              <TableCell>
                <Select
                  value=""
                  onValueChange={(value) => handleAccountCodeSelect(expense.id, value)}
                >
                  <SelectTrigger className="w-full text-left">
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
              </TableCell>
              <TableCell className="text-right font-semibold">
                ${expense.spent.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

ExpenseClassifier.displayName = 'ExpenseClassifier';

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
  const [selectedAccountCodes, setSelectedAccountCodes] = useState<Record<string, string>>({});

  // Extract just the account name without account number
  const getAccountName = (sourceAccount: string) => {
    if (!sourceAccount || sourceAccount === "Unknown") return "Unknown";
    // If it contains a dash or space followed by account number, extract just the name part
    const parts = sourceAccount.split(/[-\s]+/);
    return parts[0] || sourceAccount;
  };

  const handleClassifyExpense = (expenseId: string) => {
    const accountCode = selectedAccountCodes[expenseId];
    console.log('Reclassifying expense - changing category:', { expenseId, accountCode, selectedAccountCodes });
    
    if (accountCode) {
      onExpenseClassified(expenseId, accountCode);
      // Remove from selected after classification
      setSelectedAccountCodes(prev => {
        const updated = { ...prev };
        delete updated[expenseId];
        return updated;
      });
    } else {
      console.warn('No account code selected for expense:', expenseId);
    }
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
      // Remove from selected after deletion
      setSelectedAccountCodes(prev => {
        const updated = { ...prev };
        delete updated[expenseId];
        return updated;
      });
    }
  };

  const handleAccountCodeSelect = (expenseId: string, accountCode: string) => {
    console.log('Account code selected for reclassification:', { expenseId, accountCode });
    setSelectedAccountCodes(prev => ({
      ...prev,
      [expenseId]: accountCode
    }));
  };

  if (expenses.length === 0) {
    return <ExpensesTable expenses={expenses} accountCodes={accountCodes} showClassificationStatus={false} />;
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-4 items-center">
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
                <p className="text-sm text-slate-600">AI Category</p>
                <p className="font-medium text-blue-600">{expense.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Amount</p>
                <p className="font-semibold text-green-600">${expense.spent.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <Select
              value={selectedAccountCodes[expense.id] || ""}
              onValueChange={(value) => handleAccountCodeSelect(expense.id, value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose different category" />
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
              title="Accept the AI-suggested category and assign matching account code"
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
            
            <Button
              onClick={() => handleClassifyExpense(expense.id)}
              disabled={!selectedAccountCodes[expense.id]}
              size="sm"
              title="Assign the selected account code to this expense"
            >
              Reclassify
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

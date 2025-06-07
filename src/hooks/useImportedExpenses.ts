
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { Expense } from "@/pages/Index";

export const useImportedExpenses = () => {
  const [importedExpenses, setImportedExpenses] = useState<Expense[]>([]);

  const handleExpensesUploaded = (newExpenses: Expense[]) => {
    console.log('New expenses uploaded:', newExpenses);
    setImportedExpenses(newExpenses);
    toast({
      title: "File Processed",
      description: `${newExpenses.length} expenses ready for review`,
    });
  };

  const handleDeleteImportedExpense = (expenseId: string) => {
    console.log('Deleting imported expense with ID:', expenseId);
    setImportedExpenses(prev => {
      const filtered = prev.filter(expense => expense.id !== expenseId);
      console.log('Remaining expenses after deletion:', filtered.length);
      return filtered;
    });
    toast({
      title: "Expense Removed",
      description: "Expense removed from import",
    });
  };

  const handleBulkDeleteImportedExpenses = (expenseIds: string[]) => {
    console.log('Bulk deleting imported expenses with IDs:', expenseIds);
    setImportedExpenses(prev => {
      const filtered = prev.filter(expense => !expenseIds.includes(expense.id));
      console.log('Remaining expenses after bulk deletion:', filtered.length);
      return filtered;
    });
    toast({
      title: "Expenses Removed",
      description: `${expenseIds.length} expenses removed from import`,
    });
  };

  const handleClearImportedExpenses = () => {
    console.log('Clearing all imported expenses');
    setImportedExpenses([]);
    toast({
      title: "Cleared",
      description: "All imported expenses cleared",
    });
  };

  return {
    importedExpenses,
    setImportedExpenses,
    handleExpensesUploaded,
    handleDeleteImportedExpense,
    handleBulkDeleteImportedExpenses,
    handleClearImportedExpenses,
  };
};

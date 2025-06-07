
import { toast } from "@/hooks/use-toast";
import { useClassifyExpense } from "@/hooks/useExpenses";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useBulkDeleteExpenses } from "@/hooks/useBulkDeleteExpenses";

export const useExpenseOperations = () => {
  const classifyExpense = useClassifyExpense();
  const deleteExpense = useDeleteExpense();
  const bulkDeleteExpenses = useBulkDeleteExpenses();

  const handleExpenseClassified = async (expenseId: string, accountCode: string) => {
    console.log('Classifying expense with account code:', { expenseId, accountCode });

    try {
      await classifyExpense.mutateAsync({ 
        expenseId, 
        accountCode 
      });
      toast({
        title: "Success",
        description: "Expense classified successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to classify expense",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUnclassifiedExpense = async (expenseId: string) => {
    console.log('Deleting unclassified expense:', expenseId);
    
    try {
      await deleteExpense.mutateAsync(expenseId);
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleBulkDeleteUnclassifiedExpenses = async (expenseIds: string[]) => {
    console.log('Bulk deleting unclassified expenses:', expenseIds);
    
    try {
      await bulkDeleteExpenses.mutateAsync(expenseIds);
      toast({
        title: "Success",
        description: `${expenseIds.length} expenses deleted successfully`,
      });
    } catch (error) {
      console.error('Error bulk deleting expenses:', error);
      toast({
        title: "Error",
        description: "Failed to delete expenses",
        variant: "destructive",
      });
    }
  };

  return {
    handleExpenseClassified,
    handleDeleteUnclassifiedExpense,
    handleBulkDeleteUnclassifiedExpenses,
  };
};

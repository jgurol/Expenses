
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Expense } from '@/pages/Index';

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(code)
        `)
        .eq('archived', false) // Filter out archived expenses
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map(expense => ({
        id: expense.id,
        date: expense.date,
        description: expense.description,
        category: expense.category,
        spent: Number(expense.spent),
        sourceAccount: expense.sourceaccount || 'Unknown', // Only fall back to 'Unknown', not category
        classified: expense.classified,
        reconciled: expense.reconciled
      }));
    },
  });
};

export const useAddExpenses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expenses: Omit<Expense, 'id'>[]) => {
      const expensesToInsert = expenses.map(expense => ({
        date: expense.date,
        description: expense.description,
        category: expense.category,
        spent: expense.spent,
        classified: expense.classified,
        sourceaccount: expense.sourceAccount, // Map to lowercase database field
        category_id: null // No longer automatically assigning categories during import
      }));

      const { data, error } = await supabase
        .from('expenses')
        .insert(expensesToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useClassifyExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ expenseId, accountCode }: { expenseId: string; accountCode: string }) => {
      // Get the category details to update the category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('code', accountCode)
        .single();
      
      if (categoryError) throw categoryError;

      const { data, error } = await supabase
        .from('expenses')
        .update({ 
          category: categoryData.name,
          category_id: categoryData.id, // Set the category ID for classification
          classified: true 
        })
        .eq('id', expenseId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

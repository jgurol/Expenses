
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
          category_id: categoryData.id,
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

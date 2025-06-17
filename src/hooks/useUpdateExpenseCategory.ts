
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ expenseId, categoryName, categoryId }: { 
      expenseId: string; 
      categoryName: string;
      categoryId: string;
    }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({ 
          category: categoryName,
          category_id: categoryId
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

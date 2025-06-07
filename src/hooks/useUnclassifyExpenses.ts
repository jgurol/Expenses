
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUnclassifyExpenses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expenseIds: string[]) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({ 
          classified: false,
          category_id: null,
          category: 'Unclassified'
        })
        .in('id', expenseIds)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

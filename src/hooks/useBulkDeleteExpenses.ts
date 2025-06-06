
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBulkDeleteExpenses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expenseIds: string[]) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .in('id', expenseIds);
      
      if (error) throw error;
      return expenseIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

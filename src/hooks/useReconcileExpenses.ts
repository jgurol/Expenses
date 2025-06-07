
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReconcileExpenses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expenseIds: string[]) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({ reconciled: true })
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

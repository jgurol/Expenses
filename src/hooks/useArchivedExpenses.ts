
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useArchivedExpenses = () => {
  return useQuery({
    queryKey: ['archivedExpenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(code)
        `)
        .eq('archived', true) // Only get archived expenses
        .order('archived_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(expense => ({
        id: expense.id,
        date: expense.date,
        description: expense.description,
        category: expense.category,
        spent: Number(expense.spent),
        sourceAccount: expense.sourceaccount || 'Unknown',
        classified: expense.classified,
        reconciled: expense.reconciled,
        archivedAt: expense.archived_at
      }));
    },
  });
};

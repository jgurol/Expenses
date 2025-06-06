
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
          account_codes(code)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map(expense => ({
        id: expense.id,
        date: expense.date,
        description: expense.description,
        category: expense.category,
        spent: Number(expense.spent),
        accountCode: expense.account_codes?.code,
        classified: expense.classified
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
        classified: expense.classified
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
    mutationFn: async ({ expenseId, accountCodeId }: { expenseId: string; accountCodeId: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({ 
          account_code_id: accountCodeId, 
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

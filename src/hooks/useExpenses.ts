
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
      // First, get all account codes to map accountCode strings to IDs
      const { data: accountCodes, error: accountCodesError } = await supabase
        .from('account_codes')
        .select('id, code');
      
      if (accountCodesError) throw accountCodesError;

      const expensesToInsert = expenses.map(expense => {
        // Find the account_code_id based on the accountCode string
        const accountCodeRecord = accountCodes?.find(ac => ac.code === expense.accountCode);
        
        return {
          date: expense.date,
          description: expense.description,
          category: expense.category,
          spent: expense.spent,
          classified: expense.classified,
          account_code_id: accountCodeRecord?.id || null
        };
      });

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

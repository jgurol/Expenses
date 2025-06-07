
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
        sourceAccount: expense.source_account, // Map source_account to sourceAccount
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
        classified: expense.classified,
        source_account: expense.sourceAccount, // Map sourceAccount to source_account
        account_code_id: null // No longer automatically assigning account codes during import
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
      // Get the account code details to update the category
      const { data: accountCodeData, error: accountCodeError } = await supabase
        .from('account_codes')
        .select('id, name')
        .eq('code', accountCode)
        .single();
      
      if (accountCodeError) throw accountCodeError;

      const { data, error } = await supabase
        .from('expenses')
        .update({ 
          category: accountCodeData.name,
          account_code_id: accountCodeData.id, // Set the account code ID for classification
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

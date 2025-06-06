
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Account {
  id: string;
  account_code_id: string;
  account_number: string;
  name: string;
  description?: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  account_code?: {
    code: string;
    name: string;
    type: string;
  };
}

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          account_codes(code, name, type)
        `)
        .order('account_number');
      
      if (error) throw error;
      
      return data.map(account => ({
        id: account.id,
        account_code_id: account.account_code_id,
        account_number: account.account_number,
        name: account.name,
        description: account.description,
        balance: Number(account.balance),
        is_active: account.is_active,
        created_at: account.created_at,
        updated_at: account.updated_at,
        account_code: account.account_codes
      }));
    },
  });
};

export const useAddAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAccount: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'account_code'>) => {
      const { data, error } = await supabase
        .from('accounts')
        .insert([newAccount])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

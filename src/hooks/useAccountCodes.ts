
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AccountCode } from '@/pages/Index';

export const useAccountCodes = () => {
  return useQuery({
    queryKey: ['accountCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_codes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      
      return data.map(code => ({
        id: code.id,
        code: code.code,
        name: code.name,
        type: code.type as AccountCode['type']
      }));
    },
  });
};

export const useAddAccountCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCode: Omit<AccountCode, 'id'>) => {
      const { data, error } = await supabase
        .from('account_codes')
        .insert([newCode])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountCodes'] });
    },
  });
};

export const useUpdateAccountCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AccountCode> & { id: string }) => {
      const { data, error } = await supabase
        .from('account_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountCodes'] });
    },
  });
};

export const useDeleteAccountCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('account_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountCodes'] });
    },
  });
};

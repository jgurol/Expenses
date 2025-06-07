
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Source {
  id: string;
  account_number: string;
  name: string;
  description?: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSources = () => {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('account_number');
      
      if (error) throw error;
      
      return data.map(source => ({
        id: source.id,
        account_number: source.account_number,
        name: source.name,
        description: source.description,
        balance: Number(source.balance),
        is_active: source.is_active,
        created_at: source.created_at,
        updated_at: source.updated_at
      }));
    },
  });
};

export const useAddSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSource: Omit<Source, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sources')
        .insert([newSource])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
};

export const useUpdateSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Source> & { id: string }) => {
      const { data, error } = await supabase
        .from('sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
};

export const useDeleteSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AccountCode } from '@/pages/Index';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
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

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCode: Omit<AccountCode, 'id'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([newCode])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AccountCode> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        // Check if it's a foreign key constraint error and provide specific guidance
        if (error.message.includes('violates foreign key constraint')) {
          if (error.message.includes('sources_category_id_fkey')) {
            throw new Error('Cannot delete this category because it is being used by existing sources. Please delete or reassign all sources using this category first.');
          } else if (error.message.includes('expenses_category_id_fkey')) {
            throw new Error('Cannot delete this category because it is being used by existing expenses. Please delete or reclassify all expenses using this category first.');
          } else {
            throw new Error('Cannot delete this category because it is being used by other records. Please remove all references first.');
          }
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

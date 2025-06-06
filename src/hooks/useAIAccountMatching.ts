
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AccountCode } from '@/pages/Index';

interface MatchExpenseRequest {
  description: string;
  accountCodes: AccountCode[];
}

interface MatchExpenseResponse {
  suggestedAccountCode: string | null;
  confidence: 'high' | 'low';
  error?: string;
}

export const useAIAccountMatching = () => {
  return useMutation({
    mutationFn: async ({ description, accountCodes }: MatchExpenseRequest): Promise<MatchExpenseResponse> => {
      const { data, error } = await supabase.functions.invoke('match-expense-to-account', {
        body: { description, accountCodes }
      });

      if (error) {
        console.error('Error calling AI matching function:', error);
        return { suggestedAccountCode: null, confidence: 'low', error: error.message };
      }

      return data;
    },
  });
};


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, accountCodes } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a simplified list of account codes for the AI
    const accountCodesList = accountCodes.map((ac: any) => `${ac.code}: ${ac.name} (${ac.type})`).join('\n');

    const prompt = `Given the expense description "${description}", which of these account codes would be the best match? Return ONLY the account code (e.g., "MEALS", "OFFICE_SUPPLIES", etc.), not the full line.

Available account codes:
${accountCodesList}

Consider:
- The nature of the expense
- Common business categorization
- The account type (expense accounts for costs, asset accounts for purchases that retain value)

Return only the account code, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert accountant that matches expense descriptions to chart of accounts. Return only the account code that best matches the expense description.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const suggestedCode = data.choices[0].message.content.trim();

    // Verify the suggested code exists in our account codes
    const matchedAccountCode = accountCodes.find((ac: any) => ac.code === suggestedCode);

    return new Response(JSON.stringify({ 
      suggestedAccountCode: matchedAccountCode ? suggestedCode : null,
      confidence: matchedAccountCode ? 'high' : 'low'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in match-expense-to-account function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestedAccountCode: null,
      confidence: 'low'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

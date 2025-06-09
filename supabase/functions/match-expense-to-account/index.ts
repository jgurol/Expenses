
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

    const prompt = `Given the expense description "${description}", analyze if there is a CLEAR and OBVIOUS match to one of these account codes. 

Available account codes:
${accountCodesList}

IMPORTANT INSTRUCTIONS:
- Only suggest an account code if you are VERY CONFIDENT (90%+ certain) about the match
- If the expense description is vague, unclear, or could match multiple categories, respond with "NO_MATCH"
- Only return the exact account code (e.g., "MEALS", "OFFICE_SUPPLIES") if you're certain
- If uncertain, respond with "NO_MATCH"

Examples of when to suggest:
- "McDonald's lunch" → MEALS (clear food expense)
- "Office Depot paper supplies" → OFFICE_SUPPLIES (clear office supplies)
- "Uber ride to client meeting" → TRANSPORTATION (clear transportation)

Examples of when to return NO_MATCH:
- "Amazon purchase" (could be anything)
- "Monthly service" (too vague)
- "Consulting fee" (could be multiple categories)

Response (account code or NO_MATCH):`;

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
            content: 'You are a conservative expense categorization expert. Only suggest account codes when you are very confident about the match. When in doubt, respond with NO_MATCH.' 
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
    const aiResponse = data.choices[0].message.content.trim();

    // Check if AI decided not to make a suggestion
    if (aiResponse === 'NO_MATCH') {
      return new Response(JSON.stringify({ 
        suggestedAccountCode: null,
        confidence: 'low'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the suggested code exists in our account codes
    const matchedAccountCode = accountCodes.find((ac: any) => ac.code === aiResponse);

    return new Response(JSON.stringify({ 
      suggestedAccountCode: matchedAccountCode ? aiResponse : null,
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

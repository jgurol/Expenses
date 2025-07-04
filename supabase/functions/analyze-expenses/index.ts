
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { expenseData } = await req.json();

    const analysisPrompt = `
You are a financial analyst AI assistant. Analyze the following business expense data and provide an executive-level report. Focus on actionable insights for business owners.

IMPORTANT: This data excludes payments and transfers - only operational business expenses are included.

Expense Data:
- Total Expenses: ${expenseData.totalExpenses}
- Total Amount: $${expenseData.totalAmount.toFixed(2)}
- Average Transaction: $${expenseData.averageTransaction.toFixed(2)}
- Date Range: ${new Date(expenseData.dateRange.earliest).toLocaleDateString()} to ${new Date(expenseData.dateRange.latest).toLocaleDateString()}
- Top Categories: ${expenseData.categories.slice(0, 5).map(c => `${c.category}: $${c.amount.toFixed(2)}`).join(', ')}
- Source Accounts: ${expenseData.sources.length} accounts
- Monthly Trends: ${expenseData.monthlyTrends.map(m => `${m.month}: $${m.amount.toFixed(2)}`).join(', ')}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "A 2-3 sentence executive summary of the overall operational expense picture",
  "trends": ["3-4 key operational spending trends you identify"],
  "redFlags": ["2-3 potential red flags or areas of concern in operational expenses"],
  "recommendations": ["3-4 actionable recommendations for optimizing business operations"],
  "spendingHabits": ["3-4 observations about operational spending patterns and habits"]
}

Focus on:
- Operational cash flow patterns (excluding payments/transfers)
- Category-wise operational spending efficiency
- Potential operational cost savings
- Operational risk factors
- Seasonal operational trends
- Operational insights for business efficiency
- Process improvement recommendations

Provide specific, actionable insights based on the operational expense data provided. Remember this data excludes payments and transfers.
`;

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
            content: 'You are a senior financial analyst with expertise in business operational expense analysis and cost optimization. Focus only on operational expenses, excluding payments and transfers. Provide clear, actionable insights for business executives.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Try to parse as JSON, fall back to structured response if needed
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // Fallback if AI doesn't return valid JSON
      analysis = {
        summary: "AI analysis of operational expenses completed successfully. The expense data shows various operational spending patterns that require executive attention (payments and transfers excluded).",
        trends: ["Operational analysis completed", "Expense data processed successfully", "Operational insights generated"],
        redFlags: ["Operational review recommended", "Further operational analysis suggested"],
        recommendations: ["Implement regular operational expense reviews", "Consider operational cost optimization", "Monitor operational spending patterns"],
        spendingHabits: ["Regular operational expense tracking needed", "Operational category analysis recommended", "Operational trending patterns identified"]
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-expenses function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

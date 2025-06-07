
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpenseSummaryByCategoryProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
}

// AI-generated snippy comments for different spending categories
const getAIComment = (categoryName: string, amount: number, count: number): string => {
  const avgAmount = amount / count;
  
  // Generic comments based on category patterns
  if (categoryName.toLowerCase().includes('office') || categoryName.toLowerCase().includes('supplies')) {
    if (amount > 500) return "Really? More office supplies? What are you doing, building a fort out of staplers?";
    return "Office supplies again... let me guess, you 'needed' another fancy pen?";
  }
  
  if (categoryName.toLowerCase().includes('travel') || categoryName.toLowerCase().includes('transport')) {
    if (avgAmount > 100) return "First class travel I see... must be nice to live the high life on company dime!";
    return "All this traveling and still no frequent flyer status? Impressive mediocrity.";
  }
  
  if (categoryName.toLowerCase().includes('meal') || categoryName.toLowerCase().includes('food') || categoryName.toLowerCase().includes('restaurant')) {
    if (avgAmount > 50) return "Fancy dining, eh? I hope those overpriced meals came with a side of business value.";
    return "More food expenses... apparently 'business lunch' is code for 'I was hungry.'";
  }
  
  if (categoryName.toLowerCase().includes('software') || categoryName.toLowerCase().includes('subscription')) {
    if (count > 5) return "Another subscription? At this rate, you'll be paying for air soon.";
    return "Software subscriptions piling up... collecting apps like they're Pokemon cards?";
  }
  
  if (categoryName.toLowerCase().includes('marketing') || categoryName.toLowerCase().includes('advertising')) {
    if (amount > 1000) return "Big marketing budget! Too bad throwing money at ads doesn't guarantee customers.";
    return "Marketing expenses... because apparently 'word of mouth' isn't good enough anymore.";
  }
  
  if (categoryName.toLowerCase().includes('equipment') || categoryName.toLowerCase().includes('hardware')) {
    if (avgAmount > 200) return "More equipment? What happened to the last batch - did it evaporate?";
    return "Equipment purchases... someone's building quite the collection of 'essential' gadgets.";
  }
  
  // Fallback comments based on amount ranges
  if (amount > 2000) return "Wow, big spender! I hope this category actually generates revenue and isn't just wishful thinking.";
  if (amount > 1000) return "Substantial spending here... somebody's either very ambitious or very optimistic about the budget.";
  if (amount > 500) return "Decent chunk of change in this category. Hope it's worth more than the paper receipts it's printed on.";
  if (count > 10) return "Lots of transactions here... death by a thousand paper cuts, expense edition.";
  if (avgAmount > 100) return "High average spending per transaction. Someone's got expensive taste in business expenses.";
  
  return "Another expense category, another opportunity to wonder if this was really necessary.";
};

export const ExpenseSummaryByCategory = ({ expenses, accountCodes }: ExpenseSummaryByCategoryProps) => {
  // Group expenses by category and calculate totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        count: 0,
        code: accountCodes.find(code => code.name === category)?.code || 'N/A'
      };
    }
    acc[category].total += expense.spent;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number; code: string }>);

  // Sort categories by total amount (descending)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b.total - a.total);

  if (sortedCategories.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending Summary by Category</h3>
        <p className="text-slate-500">No reconciled expenses to summarize.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Spending Summary by Category</h3>
      </div>
      
      <div className="space-y-4">
        {sortedCategories.map(([category, data]) => {
          const percentage = (data.total / expenses.reduce((sum, e) => sum + e.spent, 0)) * 100;
          const aiComment = getAIComment(category, data.total, data.count);
          
          return (
            <div key={category} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">{category}</h4>
                      <Badge variant="outline" className="text-xs">
                        {data.code}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                      <span>{data.count} transaction{data.count !== 1 ? 's' : ''}</span>
                      <span>${(data.total / data.count).toFixed(2)} avg</span>
                      <span>{percentage.toFixed(1)}% of total</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">
                    ${data.total.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {/* AI Comment */}
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 italic">
                    <span className="font-medium">AI Analysis:</span> {aiComment}
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

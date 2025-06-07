import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpenseSummaryByCategoryProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
}

// Generate overall spending analysis with snippy commentary
const getOverallSpendingAnalysis = (categoryTotals: Record<string, { total: number; count: number; code: string }>): string => {
  const categories = Object.keys(categoryTotals);
  const totalCategories = categories.length;
  const sortedByAmount = Object.entries(categoryTotals).sort(([, a], [, b]) => b.total - a.total);
  const topCategory = sortedByAmount[0];
  const totalSpent = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
  
  if (totalCategories === 0) return "Well, at least you managed to avoid spending money entirely. That's... something.";
  
  let analysis = `Oh wonderful, you've managed to scatter ${totalSpent.toFixed(2)} across ${totalCategories} different categories. `;
  
  if (topCategory && topCategory[1].total > totalSpent * 0.4) {
    analysis += `And look at that - you've dumped a whopping ${((topCategory[1].total / totalSpent) * 100).toFixed(1)}% into ${topCategory[0]}. Clearly someone has their priorities straight. `;
  } else {
    analysis += `At least you're consistently wasteful across all categories instead of just one. How balanced of you. `;
  }
  
  // Analyze spending patterns with attitude
  const highFreqCategories = Object.entries(categoryTotals).filter(([, data]) => data.count > 5);
  const highValueCategories = Object.entries(categoryTotals).filter(([, data]) => data.total > 1000);
  
  if (highFreqCategories.length > 0) {
    analysis += `I see you've made ${highFreqCategories.length} categories into regular money drains. Consistency is key, I suppose. `;
  }
  
  if (highValueCategories.length > 0) {
    analysis += `And ${highValueCategories.length} categories managed to hit the $1,000+ mark. Because why spend small when you can spend big? `;
  }
  
  const avgPerCategory = totalSpent / totalCategories;
  if (avgPerCategory > 500) {
    analysis += "With an average of $" + avgPerCategory.toFixed(2) + " per category, you're really showing that money who's boss.";
  } else {
    analysis += "At least your spending per category is somewhat restrained. Baby steps, I guess.";
  }
  
  return analysis;
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

  const overallAnalysis = getOverallSpendingAnalysis(categoryTotals);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Spending Summary by Category</h3>
      </div>
      
      {/* Overall Spending Analysis */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">Reality Check on Your Spending</h4>
            <p className="text-sm text-red-800">{overallAnalysis}</p>
          </div>
        </div>
      </div>
      
      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCategories.map(([category, data]) => {
          const percentage = (data.total / expenses.reduce((sum, e) => sum + e.spent, 0)) * 100;
          
          return (
            <Card key={category} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900 text-sm">{category}</h4>
                      <Badge variant="outline" className="text-xs">
                        {data.code}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      ${data.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{data.count} transaction{data.count !== 1 ? 's' : ''}</span>
                    <span>{percentage.toFixed(1)}% of total</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    ${(data.total / data.count).toFixed(2)} average
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};

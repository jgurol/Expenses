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
  
  let analysis = `You've blown $${totalSpent.toFixed(2)} across ${totalCategories} categories. `;
  
  // Focus on top category with wondering commentary
  if (topCategory) {
    const [categoryName, data] = topCategory;
    const percentage = ((data.total / totalSpent) * 100).toFixed(1);
    
    analysis += `Your biggest drain is "${categoryName}" at $${data.total.toFixed(2)} (${percentage}%). `;
    
    // Category-specific wondering/questioning roasts
    if (categoryName.toLowerCase().includes('food') || categoryName.toLowerCase().includes('dining') || categoryName.toLowerCase().includes('restaurant')) {
      analysis += `I'm curious - what exactly are you eating that costs this much? Gold-plated avocado toast? `;
    } else if (categoryName.toLowerCase().includes('entertainment') || categoryName.toLowerCase().includes('fun')) {
      analysis += `I wonder what kind of "entertainment" requires hemorrhaging this much cash? `;
    } else if (categoryName.toLowerCase().includes('travel') || categoryName.toLowerCase().includes('vacation')) {
      analysis += `Fascinating travel choices - are you buying first-class tickets to Mars? `;
    } else if (categoryName.toLowerCase().includes('shopping') || categoryName.toLowerCase().includes('retail')) {
      analysis += `I'm genuinely wondering what you're buying that adds up to this astronomical amount? `;
    } else if (categoryName.toLowerCase().includes('office') || categoryName.toLowerCase().includes('supplies')) {
      analysis += `What kind of office supplies cost this much - diamond-encrusted staplers? `;
    } else if (categoryName.toLowerCase().includes('gas') || categoryName.toLowerCase().includes('fuel')) {
      analysis += `Are you driving a tank or just really bad at finding gas stations? `;
    } else if (categoryName.toLowerCase().includes('coffee') || categoryName.toLowerCase().includes('cafe')) {
      analysis += `I'm dying to know - is this coffee made from unicorn tears? `;
    } else if (categoryName.toLowerCase().includes('subscription') || categoryName.toLowerCase().includes('streaming')) {
      analysis += `How many streaming services does one person need? Are you single-handedly funding Netflix? `;
    } else {
      analysis += `I'm genuinely baffled by what could possibly cost this much in this category. `;
    }
    
    // Quick jab at runner-up if exists
    if (sortedByAmount.length > 1) {
      const runnerUp = sortedByAmount[1];
      analysis += `Runner-up "${runnerUp[0]}" at $${runnerUp[1].total.toFixed(2)} isn't helping your case either.`;
    }
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

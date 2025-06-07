import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpenseSummaryByCategoryProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
}

// Random wondering commentary for different categories
const getCategoryCommentary = (categoryName: string): string => {
  const lowerCategory = categoryName.toLowerCase();
  
  if (lowerCategory.includes('food') || lowerCategory.includes('dining') || lowerCategory.includes('restaurant')) {
    const comments = [
      "what exactly are you eating that costs this much? Gold-plated avocado toast?",
      "are you dining exclusively at Michelin-starred establishments?",
      "I'm genuinely curious - is this food or are you buying the entire restaurant?",
      "what kind of culinary adventures require this level of financial commitment?",
      "are you eating caviar for breakfast or just really bad at cooking?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  if (lowerCategory.includes('entertainment') || lowerCategory.includes('fun')) {
    const comments = [
      "what kind of \"entertainment\" requires hemorrhaging this much cash?",
      "are you personally funding Broadway shows?",
      "I'm wondering what passes for fun when it costs this astronomical amount?",
      "what exactly are you being entertained by - private concerts?",
      "is this entertainment or are you buying happiness by the pound?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  if (lowerCategory.includes('travel') || lowerCategory.includes('vacation')) {
    const comments = [
      "are you buying first-class tickets to Mars?",
      "what kind of travel involves spending this much - space tourism?",
      "I'm curious about these travel choices - private jets to corner stores?",
      "are you traveling or relocating entire cities?",
      "what destinations require this level of financial sacrifice?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  if (lowerCategory.includes('shopping') || lowerCategory.includes('retail')) {
    const comments = [
      "what are you buying that adds up to this astronomical amount?",
      "are you shopping for a small country's GDP?",
      "I'm genuinely wondering what retail therapy looks like at this price point?",
      "what exactly requires this level of consumer dedication?",
      "are you collecting rare artifacts or just really enthusiastic about shopping?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  if (lowerCategory.includes('office') || lowerCategory.includes('supplies')) {
    const comments = [
      "what kind of office supplies cost this much - diamond-encrusted staplers?",
      "are you running an office or a luxury boutique?",
      "I'm wondering what office essentials require this investment?",
      "what exactly do you need for work that costs this fortune?",
      "are these supplies or are you buying the entire office building?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  if (lowerCategory.includes('gas') || lowerCategory.includes('fuel')) {
    const comments = [
      "are you driving a tank or just really bad at finding gas stations?",
      "what kind of vehicle requires this much fuel - a rocket ship?",
      "I'm curious about your transportation choices at this price point?",
      "are you commuting to another planet?",
      "what exactly are you fueling that costs this astronomical amount?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  if (lowerCategory.includes('coffee') || lowerCategory.includes('cafe')) {
    const comments = [
      "is this coffee made from unicorn tears?",
      "what kind of caffeine addiction requires this level of funding?",
      "are you drinking liquid gold or just really expensive beans?",
      "I'm wondering what coffee costs this much - imported from space?",
      "what exactly are you brewing that requires this investment?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  if (lowerCategory.includes('subscription') || lowerCategory.includes('streaming')) {
    const comments = [
      "how many streaming services does one person need? Are you single-handedly funding Netflix?",
      "what subscriptions cost this much - premium access to the internet?",
      "are you subscribing to every service known to humanity?",
      "I'm curious about what requires this level of monthly commitment?",
      "what exactly are you subscribing to that adds up to this amount?"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  // Generic comments for unrecognized categories
  const genericComments = [
    "I'm genuinely baffled by what could possibly cost this much in this category.",
    "what exactly requires this level of financial commitment?",
    "I'm wondering what kind of expenses justify this astronomical spending?",
    "what are you buying that adds up to this mind-boggling total?",
    "I'm curious about what necessities cost this much money?"
  ];
  
  return genericComments[Math.floor(Math.random() * genericComments.length)];
};

// Generate overall spending analysis with randomized snippy commentary
const getOverallSpendingAnalysis = (categoryTotals: Record<string, { total: number; count: number; code: string }>): string => {
  const categories = Object.keys(categoryTotals);
  const totalCategories = categories.length;
  const sortedByAmount = Object.entries(categoryTotals).sort(([, a], [, b]) => b.total - a.total);
  const topCategory = sortedByAmount[0];
  const totalSpent = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
  
  if (totalCategories === 0) return "Well, at least you managed to avoid spending money entirely. That's... something.";
  
  // Random opening phrases
  const openings = [
    `You've blown $${totalSpent.toFixed(2)} across ${totalCategories} categories.`,
    `Congratulations on spending $${totalSpent.toFixed(2)} across ${totalCategories} different ways.`,
    `Your wallet took a $${totalSpent.toFixed(2)} hit across ${totalCategories} categories.`,
    `You managed to distribute $${totalSpent.toFixed(2)} across ${totalCategories} spending categories.`
  ];
  
  let analysis = openings[Math.floor(Math.random() * openings.length)] + " ";
  
  // Focus on top category with wondering commentary
  if (topCategory) {
    const [categoryName, data] = topCategory;
    const percentage = ((data.total / totalSpent) * 100).toFixed(1);
    
    analysis += `Your biggest drain is "${categoryName}" at $${data.total.toFixed(2)} (${percentage}%). `;
    analysis += getCategoryCommentary(categoryName) + " ";
    
    // Random runner-up comments if exists
    if (sortedByAmount.length > 1) {
      const runnerUp = sortedByAmount[1];
      const runnerUpComments = [
        `Runner-up "${runnerUp[0]}" at $${runnerUp[1].total.toFixed(2)} isn't helping your case either.`,
        `And "${runnerUp[0]}" at $${runnerUp[1].total.toFixed(2)} is making things worse.`,
        `Plus "${runnerUp[0]}" weighing in at $${runnerUp[1].total.toFixed(2)} for good measure.`
      ];
      analysis += runnerUpComments[Math.floor(Math.random() * runnerUpComments.length)];
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

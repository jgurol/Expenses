
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatUtils";

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  spent: number;
  sourceAccount: string;
  classified: boolean;
  reconciled: boolean;
  archivedAt: string;
}

interface ExpenseCommentaryProps {
  expenses: Expense[];
}

// Generate concise 3-sentence commentary about spending patterns
const generateSpendingCommentary = (expenses: Expense[]): string[] => {
  if (expenses.length === 0) return ["No expenses to analyze.", "Consider adding some expenses to get insights.", "Your wallet is safe for now."];
  
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.spent, 0);
  const avgTransaction = totalSpent / expenses.length;
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.spent;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedCategories = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a);
  const topCategory = sortedCategories[0];
  const largestExpense = Math.max(...expenses.map(exp => exp.spent));
  
  const commentary: string[] = [];
  
  // Sentence 1: Overview
  commentary.push(`You've spent ${formatCurrency(totalSpent)} across ${expenses.length} transactions with an average of ${formatCurrency(avgTransaction)} per expense.`);
  
  // Sentence 2: Top category insight
  if (topCategory) {
    const [categoryName, amount] = topCategory;
    const percentage = ((amount / totalSpent) * 100).toFixed(1);
    
    let categoryInsight = `Your biggest spending category is "${categoryName}" at ${formatCurrency(amount)} (${percentage}% of total)`;
    
    // Add category-specific comment
    const lowerCategory = categoryName.toLowerCase();
    if (lowerCategory.includes('food') || lowerCategory.includes('dining')) {
      categoryInsight += " - quite the foodie, aren't you?";
    } else if (lowerCategory.includes('entertainment')) {
      categoryInsight += " - living your best life!";
    } else if (lowerCategory.includes('travel')) {
      categoryInsight += " - wanderlust is expensive.";
    } else if (lowerCategory.includes('shopping')) {
      categoryInsight += " - retail therapy in action.";
    } else {
      categoryInsight += " - that's where the money goes.";
    }
    
    commentary.push(categoryInsight);
  }
  
  // Sentence 3: Notable pattern or recommendation
  if (largestExpense > avgTransaction * 3) {
    commentary.push(`Your largest single expense of ${formatCurrency(largestExpense)} is significantly above average - consider setting spending alerts for large transactions.`);
  } else if (Object.keys(categoryTotals).length > 10) {
    commentary.push(`With spending across ${Object.keys(categoryTotals).length} categories, you might benefit from consolidating similar expense types for better budget tracking.`);
  } else {
    commentary.push("Your spending patterns show good category focus - keep monitoring trends to maintain financial awareness.");
  }
  
  return commentary;
};

export const ExpenseCommentary = ({ expenses }: ExpenseCommentaryProps) => {
  const commentary = generateSpendingCommentary(expenses);
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-slate-900">Expense Commentary</h3>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Quick Insights
        </Badge>
      </div>
      
      <div className="space-y-4">
        {commentary.map((comment, index) => (
          <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <div className="flex-shrink-0 mt-1">
              {index === 0 ? (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <p className="text-slate-700 leading-relaxed">{comment}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          💡 Pro Tip: This concise analysis highlights your key spending patterns. 
          Monitor these trends regularly for better financial insights.
        </p>
      </div>
    </Card>
  );
};

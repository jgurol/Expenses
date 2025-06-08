
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

// Generate sarcastic commentary about spending patterns
const generateSpendingCommentary = (expenses: Expense[]): string[] => {
  if (expenses.length === 0) return ["Well, at least you're not spending money on anything. That's... economical."];
  
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
  
  // Opening statement
  commentary.push(`You've managed to spend ${formatCurrency(totalSpent)} across ${expenses.length} transactions. Impressive financial dedication.`);
  
  // Category analysis
  if (topCategory) {
    const [categoryName, amount] = topCategory;
    const percentage = ((amount / totalSpent) * 100).toFixed(1);
    
    let categoryComment = `Your biggest money pit is "${categoryName}" at ${formatCurrency(amount)} (${percentage}% of total spending). `;
    
    // Category-specific commentary
    const lowerCategory = categoryName.toLowerCase();
    if (lowerCategory.includes('food') || lowerCategory.includes('dining')) {
      categoryComment += "What are you eating, gold-plated avocado toast?";
    } else if (lowerCategory.includes('entertainment')) {
      categoryComment += "Are you personally funding Hollywood?";
    } else if (lowerCategory.includes('travel')) {
      categoryComment += "Flying first-class to the corner store?";
    } else if (lowerCategory.includes('shopping')) {
      categoryComment += "Shopping therapy is getting expensive.";
    } else if (lowerCategory.includes('office')) {
      categoryComment += "Are those diamond-encrusted staplers?";
    } else {
      categoryComment += "That's a lot of money for... whatever this is.";
    }
    
    commentary.push(categoryComment);
  }
  
  // Average transaction commentary
  if (avgTransaction > 500) {
    commentary.push(`Your average transaction of ${formatCurrency(avgTransaction)} suggests you're not familiar with the concept of "small purchases."`);
  } else if (avgTransaction < 10) {
    commentary.push(`With an average transaction of ${formatCurrency(avgTransaction)}, you're either very budget-conscious or buying everything one penny at a time.`);
  } else {
    commentary.push(`Your average transaction of ${formatCurrency(avgTransaction)} is... surprisingly reasonable. Who are you and what did you do with the spendthrift?`);
  }
  
  // Largest expense commentary
  if (largestExpense > 1000) {
    commentary.push(`Your largest single expense of ${formatCurrency(largestExpense)} makes me wonder if you bought a small country or just really expensive coffee.`);
  }
  
  // Category diversity commentary
  const numCategories = Object.keys(categoryTotals).length;
  if (numCategories > 10) {
    commentary.push(`You've spread your spending across ${numCategories} categories. Congratulations on being thoroughly comprehensive in your financial destruction.`);
  } else if (numCategories < 3) {
    commentary.push(`Only ${numCategories} spending categories? Either you're incredibly focused or just getting started on your spending journey.`);
  }
  
  // Monthly pattern analysis
  const monthlySpending = expenses.reduce((acc, exp) => {
    const month = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + exp.spent;
    return acc;
  }, {} as Record<string, number>);
  
  const monthlyAmounts = Object.values(monthlySpending);
  const maxMonth = Math.max(...monthlyAmounts);
  const minMonth = Math.min(...monthlyAmounts);
  
  if (maxMonth > minMonth * 2) {
    commentary.push("Your monthly spending varies wildly. Either you have seasonal shopping disorders or your self-control comes and goes like the weather.");
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
          Brutally Honest Analysis
        </Badge>
      </div>
      
      <div className="space-y-4">
        {commentary.map((comment, index) => (
          <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <div className="flex-shrink-0 mt-1">
              {index === 0 ? (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-slate-700 leading-relaxed">{comment}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          💡 Pro Tip: This commentary is generated based on your actual spending patterns. 
          The sarcasm is free, the insights are priceless.
        </p>
      </div>
    </Card>
  );
};

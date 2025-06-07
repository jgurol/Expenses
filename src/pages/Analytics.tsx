
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { ExpensesTable } from "@/components/ExpensesTable";

const Analytics = () => {
  const navigate = useNavigate();
  
  const { data: expenses = [] } = useExpenses();
  const { data: accountCodes = [] } = useCategories();
  
  const classifiedExpenses = expenses.filter(e => e.classified);
  
  const totalAmount = classifiedExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const averageExpense = classifiedExpenses.length > 0 ? totalAmount / classifiedExpenses.length : 0;

  // Calculate category summaries
  const categorySpending = classifiedExpenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 };
    }
    acc[category].total += expense.spent;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const categorySummary = Object.entries(categorySpending)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: (data.total / totalAmount) * 100
    }))
    .sort((a, b) => b.total - a.total);

  // Generate AI complaint about spending
  const generateSpendingComplaint = () => {
    if (categorySummary.length === 0) return "No spending data to analyze yet.";
    
    const topCategory = categorySummary[0];
    const secondCategory = categorySummary[1];
    
    let complaint = `Seriously? You spent $${topCategory.total.toFixed(2)} on ${topCategory.category}? That's ${topCategory.percentage.toFixed(1)}% of your total expenses! `;
    
    if (topCategory.category.toLowerCase().includes('food') || topCategory.category.toLowerCase().includes('dining')) {
      complaint += "Maybe it's time to learn how to cook instead of ordering takeout every night. ";
    } else if (topCategory.category.toLowerCase().includes('entertainment') || topCategory.category.toLowerCase().includes('streaming')) {
      complaint += "Do you really need ANOTHER streaming service? Netflix, Disney+, Hulu... the list goes on! ";
    } else if (topCategory.category.toLowerCase().includes('shopping') || topCategory.category.toLowerCase().includes('retail')) {
      complaint += "Online shopping addiction much? Your credit card is crying. ";
    } else {
      complaint += "That's an awful lot of money for that category. ";
    }
    
    if (secondCategory && secondCategory.percentage > 15) {
      complaint += `And don't get me started on the $${secondCategory.total.toFixed(2)} you threw at ${secondCategory.category}. `;
    }
    
    complaint += `At this rate, you'll have spent $${(totalAmount * 12 / new Date().getMonth() || 1).toFixed(2)} this year. Time for a budget intervention! 💸`;
    
    return complaint;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Expense Analytics</h1>
                <p className="text-slate-600">Analysis of classified expenses</p>
              </div>
            </div>
            
            <Badge variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {classifiedExpenses.length} Classified Expenses
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* AI Spending Complaint */}
          <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-3">🤖 AI Financial Advisor (Brutally Honest Mode)</h3>
            <p className="text-red-700 leading-relaxed">{generateSpendingComplaint()}</p>
          </Card>

          {/* Category Summary */}
          {categorySummary.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySummary.map((item, index) => (
                  <div key={item.category} className="p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={index === 0 ? "bg-red-100 text-red-800" : ""}>
                        {item.category}
                      </Badge>
                      <span className="text-sm text-slate-500">{item.count} expenses</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">${item.total.toFixed(2)}</div>
                    <div className="text-sm text-slate-600">{item.percentage.toFixed(1)}% of total</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Classified</h3>
              <div className="text-3xl font-bold text-slate-900">{classifiedExpenses.length}</div>
              <div className="text-sm text-slate-500">expenses</div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Amount</h3>
              <div className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</div>
              <div className="text-sm text-slate-500">spent</div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Average Expense</h3>
              <div className="text-3xl font-bold text-blue-600">${averageExpense.toFixed(2)}</div>
              <div className="text-sm text-slate-500">per transaction</div>
            </Card>
          </div>

          {/* Expenses Table */}
          <ExpensesTable 
            expenses={classifiedExpenses}
            accountCodes={accountCodes}
            title="Classified Expenses"
            showClassificationStatus={true}
            showDeleteButton={false}
            showMultiSelect={false}
            showCodeColumn={true}
          />
        </div>
      </main>
    </div>
  );
};

export default Analytics;

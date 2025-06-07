
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { ExpensesTable } from "@/components/ExpensesTable";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const Analytics = () => {
  const navigate = useNavigate();
  
  const { data: expenses = [] } = useExpenses();
  const { data: accountCodes = [] } = useCategories();
  
  const classifiedExpenses = expenses.filter(e => e.classified);
  
  // Group expenses by category for analysis
  const categoryData = classifiedExpenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = {
        category: category,
        amount: 0,
        count: 0
      };
    }
    acc[category].amount += expense.spent;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { category: string; amount: number; count: number }>);

  const chartData = Object.values(categoryData);

  const totalAmount = classifiedExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const averageExpense = classifiedExpenses.length > 0 ? totalAmount / classifiedExpenses.length : 0;

  const chartConfig = {
    amount: {
      label: "Amount ($)",
    },
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

          {/* Chart Section */}
          {chartData.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Expense Distribution by Category</h3>
              </div>
              
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category"
                      dataKey="category" 
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `$${Number(value).toFixed(2)}`,
                            "Amount"
                          ]}
                        />
                      }
                    />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          )}

          {/* Expenses Table */}
          <ExpensesTable 
            expenses={classifiedExpenses}
            accountCodes={accountCodes}
            title="Classified Expenses"
            showClassificationStatus={true}
            showDeleteButton={false}
            showMultiSelect={false}
          />
        </div>
      </main>
    </div>
  );
};

export default Analytics;

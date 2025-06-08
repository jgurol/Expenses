import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Brain, AlertTriangle, FileText, Loader2, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useArchivedExpenses } from "@/hooks/useArchivedExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useSources } from "@/hooks/useSources";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ExpenseCommentary } from "@/components/ExpenseCommentary";
import { formatCurrency } from "@/utils/formatUtils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";

interface AnalysisReport {
  summary: string;
  trends: string[];
  redFlags: string[];
  recommendations: string[];
  spendingHabits: string[];
}

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { data: archivedExpenses = [] } = useArchivedExpenses();
  const { data: accountCodes = [] } = useCategories();
  const { data: sources = [] } = useSources();

  // Filter out payments and transfers from the frontend as well for safety
  const filteredExpenses = archivedExpenses.filter(expense => 
    !expense.category.toLowerCase().includes('payment') && 
    !expense.category.toLowerCase().includes('transfer')
  );

  // Prepare data for charts using filtered expenses
  const monthlySpending = filteredExpenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + expense.spent;
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlySpending).map(([month, amount]) => ({
    month,
    amount: Number(amount.toFixed(2))
  }));

  const categorySpending = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.spent;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2))
    }));

  const sourceSpending = filteredExpenses.reduce((acc, expense) => {
    const source = expense.sourceAccount || 'Unknown';
    acc[source] = (acc[source] || 0) + expense.spent;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = Object.entries(sourceSpending).map(([source, amount]) => ({
    source,
    amount: Number(amount.toFixed(2))
  }));

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  const generateAnalysis = async () => {
    if (filteredExpenses.length === 0) {
      toast({
        title: "No Data",
        description: "No archived expenses found to analyze (excluding payments and transfers)",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Prepare expense data for AI analysis
      const expenseData = {
        totalExpenses: filteredExpenses.length,
        totalAmount: filteredExpenses.reduce((sum, exp) => sum + exp.spent, 0),
        dateRange: {
          earliest: Math.min(...filteredExpenses.map(exp => new Date(exp.date).getTime())),
          latest: Math.max(...filteredExpenses.map(exp => new Date(exp.date).getTime()))
        },
        categories: categoryData,
        sources: sourceData,
        monthlyTrends: monthlyData,
        averageTransaction: filteredExpenses.reduce((sum, exp) => sum + exp.spent, 0) / filteredExpenses.length,
        largestExpense: Math.max(...filteredExpenses.map(exp => exp.spent)),
        smallestExpense: Math.min(...filteredExpenses.map(exp => exp.spent))
      };

      const response = await fetch('/api/analyze-expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenseData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }

      const result = await response.json();
      setAnalysisReport(result.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated successfully",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Fallback to basic analysis if AI fails
      const fallbackAnalysis: AnalysisReport = {
        summary: `Analysis of ${filteredExpenses.length} archived expenses (excluding payments and transfers) totaling $${filteredExpenses.reduce((sum, exp) => sum + exp.spent, 0).toFixed(2)}. The data spans from ${new Date(Math.min(...filteredExpenses.map(exp => new Date(exp.date).getTime()))).toLocaleDateString()} to ${new Date(Math.max(...filteredExpenses.map(exp => new Date(exp.date).getTime()))).toLocaleDateString()}.`,
        trends: [
          `Top spending category: ${categoryData[0]?.category} ($${categoryData[0]?.amount.toFixed(2)})`,
          `Average transaction amount: $${(filteredExpenses.reduce((sum, exp) => sum + exp.spent, 0) / filteredExpenses.length).toFixed(2)}`,
          `Most active source account: ${sourceData[0]?.source}`
        ],
        redFlags: [
          filteredExpenses.filter(exp => exp.spent > 1000).length > 0 ? `${filteredExpenses.filter(exp => exp.spent > 1000).length} transactions over $1,000` : "No unusually large transactions detected",
          categoryData.length < 3 ? "Limited expense category diversity" : "Good expense category distribution"
        ],
        recommendations: [
          "Consider setting up budget alerts for high-spend categories",
          "Review recurring expenses for potential cost savings",
          "Implement approval workflows for large transactions"
        ],
        spendingHabits: [
          `Primary expense categories: ${categoryData.slice(0, 3).map(c => c.category).join(', ')}`,
          `Transaction frequency: ${filteredExpenses.length} transactions analyzed`,
          `Spending distribution across ${Object.keys(sourceSpending).length} source accounts`
        ]
      };
      
      setAnalysisReport(fallbackAnalysis);
      
      toast({
        title: "Basic Analysis Generated",
        description: "Generated basic analysis (AI service unavailable)",
        variant: "default",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-generate analysis when expenses data is loaded
  useEffect(() => {
    if (filteredExpenses.length > 0 && !analysisReport && !isAnalyzing) {
      generateAnalysis();
    }
  }, [filteredExpenses.length]);

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.spent, 0);

  return (
    <ProtectedRoute requiredRoles={['admin', 'bookkeeper']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
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
                  <p className="text-slate-600">AI-powered analysis of archived expenses (excluding payments & transfers)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Generating AI Analysis...</span>
                  </div>
                )}
                
                <Badge variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {filteredExpenses.length} Analyzed Expenses
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Total Expenses</h3>
                <div className="text-3xl font-bold text-slate-900">{filteredExpenses.length}</div>
                <div className="text-sm text-slate-500">analyzed transactions</div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Total Amount</h3>
                <div className="text-3xl font-bold text-orange-600">{formatCurrency(totalAmount)}</div>
                <div className="text-sm text-slate-500">total spent</div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Average Transaction</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0)}
                </div>
                <div className="text-sm text-slate-500">per expense</div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Categories</h3>
                <div className="text-3xl font-bold text-green-600">{Object.keys(categorySpending).length}</div>
                <div className="text-sm text-slate-500">expense types</div>
              </Card>
            </div>

            {/* Commentary Section */}
            {filteredExpenses.length > 0 && (
              <ExpenseCommentary expenses={filteredExpenses} />
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Spending Trend */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
                <ChartContainer
                  config={{
                    amount: {
                      label: "Amount",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </Card>

              {/* Top Categories */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Spending Categories</h3>
                <ChartContainer
                  config={{
                    amount: {
                      label: "Amount",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="#82ca9d" />
                  </BarChart>
                </ChartContainer>
              </Card>

              {/* Source Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Spending by Source Account</h3>
                <ChartContainer
                  config={{
                    amount: {
                      label: "Amount",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      dataKey="amount"
                      nameKey="source"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </Card>
            </div>

            {/* AI Analysis Report */}
            {analysisReport && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <h2 className="text-xl font-semibold">AI Executive Summary</h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{analysisReport.summary}</p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Key Trends</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysisReport.trends.map((trend, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700">{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold">Red Flags</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysisReport.redFlags.map((flag, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Recommendations</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysisReport.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold">Spending Habits</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysisReport.spendingHabits.map((habit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700">{habit}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            )}

            {filteredExpenses.length === 0 && (
              <Card className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Archived Expenses</h3>
                <p className="text-slate-600">Archive some expenses first to generate analytics (payments and transfers are excluded).</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;


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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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

  // Prepare data for charts
  const monthlySpending = archivedExpenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + expense.spent;
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlySpending).map(([month, amount]) => ({
    month,
    amount: Number(amount.toFixed(2))
  }));

  const categorySpending = archivedExpenses.reduce((acc, expense) => {
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

  const sourceSpending = archivedExpenses.reduce((acc, expense) => {
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
    if (archivedExpenses.length === 0) {
      toast({
        title: "No Data",
        description: "No archived expenses found to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Prepare expense data for AI analysis
      const expenseData = {
        totalExpenses: archivedExpenses.length,
        totalAmount: archivedExpenses.reduce((sum, exp) => sum + exp.spent, 0),
        dateRange: {
          earliest: Math.min(...archivedExpenses.map(exp => new Date(exp.date).getTime())),
          latest: Math.max(...archivedExpenses.map(exp => new Date(exp.date).getTime()))
        },
        categories: categoryData,
        sources: sourceData,
        monthlyTrends: monthlyData,
        averageTransaction: archivedExpenses.reduce((sum, exp) => sum + exp.spent, 0) / archivedExpenses.length,
        largestExpense: Math.max(...archivedExpenses.map(exp => exp.spent)),
        smallestExpense: Math.min(...archivedExpenses.map(exp => exp.spent))
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
        summary: `Analysis of ${archivedExpenses.length} archived expenses totaling $${archivedExpenses.reduce((sum, exp) => sum + exp.spent, 0).toFixed(2)}. The data spans from ${new Date(Math.min(...archivedExpenses.map(exp => new Date(exp.date).getTime()))).toLocaleDateString()} to ${new Date(Math.max(...archivedExpenses.map(exp => new Date(exp.date).getTime()))).toLocaleDateString()}.`,
        trends: [
          `Top spending category: ${categoryData[0]?.category} ($${categoryData[0]?.amount.toFixed(2)})`,
          `Average transaction amount: $${(archivedExpenses.reduce((sum, exp) => sum + exp.spent, 0) / archivedExpenses.length).toFixed(2)}`,
          `Most active source account: ${sourceData[0]?.source}`
        ],
        redFlags: [
          archivedExpenses.filter(exp => exp.spent > 1000).length > 0 ? `${archivedExpenses.filter(exp => exp.spent > 1000).length} transactions over $1,000` : "No unusually large transactions detected",
          categoryData.length < 3 ? "Limited expense category diversity" : "Good expense category distribution"
        ],
        recommendations: [
          "Consider setting up budget alerts for high-spend categories",
          "Review recurring expenses for potential cost savings",
          "Implement approval workflows for large transactions"
        ],
        spendingHabits: [
          `Primary expense categories: ${categoryData.slice(0, 3).map(c => c.category).join(', ')}`,
          `Transaction frequency: ${archivedExpenses.length} transactions analyzed`,
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

  const totalAmount = archivedExpenses.reduce((sum, expense) => sum + expense.spent, 0);

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
                  <p className="text-slate-600">AI-powered analysis of archived expenses</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  onClick={generateAnalysis}
                  disabled={isAnalyzing || archivedExpenses.length === 0}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Generate AI Analysis'}
                </Button>
                
                <Badge variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {archivedExpenses.length} Archived Expenses
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
                <div className="text-3xl font-bold text-slate-900">{archivedExpenses.length}</div>
                <div className="text-sm text-slate-500">archived transactions</div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Total Amount</h3>
                <div className="text-3xl font-bold text-orange-600">${totalAmount.toFixed(2)}</div>
                <div className="text-sm text-slate-500">total spent</div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Average Transaction</h3>
                <div className="text-3xl font-bold text-blue-600">
                  ${archivedExpenses.length > 0 ? (totalAmount / archivedExpenses.length).toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-slate-500">per expense</div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Categories</h3>
                <div className="text-3xl font-bold text-green-600">{Object.keys(categorySpending).length}</div>
                <div className="text-sm text-slate-500">expense types</div>
              </Card>
            </div>

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
                      outerRadius={80}
                      dataKey="amount"
                      nameKey="source"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
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

            {archivedExpenses.length === 0 && (
              <Card className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Archived Expenses</h3>
                <p className="text-slate-600">Archive some expenses first to generate analytics.</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;

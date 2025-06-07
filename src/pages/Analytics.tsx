import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useReconcileExpense, useBulkReconcileExpenses } from "@/hooks/useReconcileExpense";
import { ExpensesTable } from "@/components/ExpensesTable";
import { useToast } from "@/hooks/use-toast";

type SortField = 'sourceAccount' | 'date' | 'code';
type SortDirection = 'asc' | 'desc';

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>('sourceAccount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const { data: expenses = [] } = useExpenses();
  const { data: accountCodes = [] } = useCategories();
  const reconcileExpenseMutation = useReconcileExpense();
  const bulkReconcileMutation = useBulkReconcileExpenses();
  
  const classifiedExpenses = expenses.filter(e => e.classified);
  
  // Sort expenses based on current sort state
  const sortedExpenses = [...classifiedExpenses].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    switch (sortField) {
      case 'sourceAccount':
        aValue = a.sourceAccount || 'Unknown';
        bValue = b.sourceAccount || 'Unknown';
        break;
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'code':
        const aCode = accountCodes.find(code => code.name === a.category)?.code || 'ZZZ';
        const bCode = accountCodes.find(code => code.name === b.category)?.code || 'ZZZ';
        aValue = aCode;
        bValue = bCode;
        break;
      default:
        aValue = a.sourceAccount || 'Unknown';
        bValue = b.sourceAccount || 'Unknown';
    }
    
    if (sortDirection === 'asc') {
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      if (sortField !== 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    } else {
      if (aValue > bValue) return -1;
      if (aValue < bValue) return 1;
      if (sortField !== 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    }
  });
  
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

  // Generate emoji based on spending percentage
  const getSpendingEmoji = (percentage: number) => {
    if (percentage >= 30) return "😡"; // Very angry for high spending
    if (percentage >= 20) return "😠"; // Angry for moderate-high spending
    if (percentage >= 15) return "😐"; // Neutral for moderate spending
    if (percentage >= 10) return "🙂"; // Slightly happy for low-moderate spending
    return "😊"; // Happy for low spending
  };

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleReconcileExpense = async (expenseId: string) => {
    try {
      await reconcileExpenseMutation.mutateAsync(expenseId);
      toast({
        title: "Success",
        description: "Expense has been reconciled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reconcile expense.",
        variant: "destructive",
      });
    }
  };

  const handleBulkReconcile = async () => {
    try {
      const expenseIds = classifiedExpenses.filter(e => !e.reconciled).map(e => e.id);
      await bulkReconcileMutation.mutateAsync(expenseIds);
      toast({
        title: "Success",
        description: `${expenseIds.length} expenses have been reconciled.`,
      });
      navigate('/reconciled');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reconcile expenses.",
        variant: "destructive",
      });
    }
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
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBulkReconcile}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={classifiedExpenses.filter(e => !e.reconciled).length === 0}
              >
                <CheckCircle className="h-4 w-4" />
                Reconcile All ({classifiedExpenses.filter(e => !e.reconciled).length})
              </Button>
              
              <Badge variant="outline" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {classifiedExpenses.length} Classified Expenses
              </Badge>
            </div>
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
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getSpendingEmoji(item.percentage)}</span>
                        <Badge variant="outline" className={index === 0 ? "bg-red-100 text-red-800" : ""}>
                          {item.category}
                        </Badge>
                      </div>
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
            expenses={sortedExpenses}
            accountCodes={accountCodes}
            title="Classified Expenses"
            showClassificationStatus={true}
            showDeleteButton={false}
            showMultiSelect={false}
            showCodeColumn={true}
            showReconcileButton={true}
            onReconcileExpense={handleReconcileExpense}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </main>
    </div>
  );
};

export default Analytics;

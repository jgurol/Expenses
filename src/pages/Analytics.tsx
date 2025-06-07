
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortField = 'sourceAccount' | 'date' | 'code';
type SortDirection = 'asc' | 'desc';

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>('sourceAccount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  
  const { data: expenses = [] } = useExpenses();
  const { data: accountCodes = [] } = useCategories();
  const reconcileExpenseMutation = useReconcileExpense();
  const bulkReconcileMutation = useBulkReconcileExpenses();
  
  const classifiedExpenses = expenses.filter(e => e.classified);
  
  // Get unique source accounts
  const uniqueAccounts = [...new Set(expenses.map(e => e.sourceAccount).filter(Boolean))];
  
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

  const handleReconcileAccount = async () => {
    if (!selectedAccount) {
      toast({
        title: "Error",
        description: "Please select an account first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const accountExpenseIds = classifiedExpenses
        .filter(e => e.sourceAccount === selectedAccount && !e.reconciled)
        .map(e => e.id);
      
      if (accountExpenseIds.length === 0) {
        toast({
          title: "Info",
          description: "No unreconciled expenses found for this account.",
        });
        return;
      }

      await bulkReconcileMutation.mutateAsync(accountExpenseIds);
      toast({
        title: "Success",
        description: `${accountExpenseIds.length} expenses from ${selectedAccount} have been reconciled.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reconcile account expenses.",
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
              <div className="flex items-center gap-2">
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueAccounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleReconcileAccount}
                  disabled={!selectedAccount}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Reconcile
                </Button>
              </div>
              
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

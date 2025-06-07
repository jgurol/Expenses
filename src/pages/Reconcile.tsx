
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Undo2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useSources } from "@/hooks/useSources";
import { useReconcileExpenses } from "@/hooks/useReconcileExpenses";
import { useUnclassifyExpenses } from "@/hooks/useUnclassifyExpenses";
import { ExpensesTable } from "@/components/ExpensesTable";
import { toast } from "@/hooks/use-toast";

type SortField = 'sourceAccount' | 'date' | 'code';
type SortDirection = 'asc' | 'desc';

const Reconcile = () => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('sourceAccount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
  const { data: expenses = [] } = useExpenses();
  const { data: accountCodes = [] } = useCategories();
  const { data: sources = [] } = useSources();
  const reconcileExpensesMutation = useReconcileExpenses();
  const unclassifyExpensesMutation = useUnclassifyExpenses();
  
  // Filter for classified but not yet reconciled expenses
  const classifiedUnreconciledExpenses = expenses.filter(e => e.classified && !e.reconciled);
  
  // Get unique source accounts from unreconciled expenses
  const sourceAccounts = Array.from(new Set(classifiedUnreconciledExpenses.map(e => e.sourceAccount).filter(Boolean)));
  
  // Sort expenses based on current sort state
  const sortedExpenses = [...classifiedUnreconciledExpenses].sort((a, b) => {
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
      // Secondary sort by date for same values
      if (sortField !== 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    } else {
      if (aValue > bValue) return -1;
      if (aValue < bValue) return 1;
      // Secondary sort by date for same values
      if (sortField !== 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    }
  });
  
  const totalAmount = classifiedUnreconciledExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const averageExpense = classifiedUnreconciledExpenses.length > 0 ? totalAmount / classifiedUnreconciledExpenses.length : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleReconcileAccount = async () => {
    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select an account to reconcile",
        variant: "destructive",
      });
      return;
    }

    // Find expenses for the selected account
    const accountExpenses = classifiedUnreconciledExpenses.filter(expense => expense.sourceAccount === selectedAccount);
    const accountExpenseIds = accountExpenses.map(expense => expense.id);
    
    try {
      await reconcileExpensesMutation.mutateAsync(accountExpenseIds);
      
      toast({
        title: "Account Reconciled",
        description: `Successfully reconciled ${accountExpenses.length} expenses from ${selectedAccount}`,
      });

      // Reset selection
      setSelectedAccount('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reconcile expenses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReconcileAll = async () => {
    const expenseIds = classifiedUnreconciledExpenses.map(expense => expense.id);
    
    try {
      await reconcileExpensesMutation.mutateAsync(expenseIds);
      
      toast({
        title: "All Expenses Reconciled",
        description: `Successfully reconciled ${expenseIds.length} expenses`,
      });
      
      // Navigate to reconciled page
      navigate('/reconciled');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reconcile expenses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnclassifyExpenses = async (expenseIds: string[]) => {
    try {
      await unclassifyExpensesMutation.mutateAsync(expenseIds);
      toast({
        title: "Success",
        description: `${expenseIds.length} expense${expenseIds.length === 1 ? '' : 's'} unclassified successfully`,
      });
    } catch (error) {
      console.error('Error unclassifying expenses:', error);
      toast({
        title: "Error",
        description: "Failed to unclassify expenses. Please try again.",
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
                variant="outline"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Reconcile Expenses</h1>
                <p className="text-slate-600">Review and reconcile classified expenses</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceAccounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={handleReconcileAccount}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedAccount || reconcileExpensesMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4" />
                  Reconcile
                </Button>
              </div>

              <Button
                onClick={handleReconcileAll}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={classifiedUnreconciledExpenses.length === 0 || reconcileExpensesMutation.isPending}
              >
                <CheckCircle className="h-4 w-4" />
                Mark All as Reconciled ({classifiedUnreconciledExpenses.length})
              </Button>
              
              <Badge variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {classifiedUnreconciledExpenses.length} Ready for Reconciliation
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
              <h3 className="text-sm font-medium text-slate-600 mb-2">Ready to Reconcile</h3>
              <div className="text-3xl font-bold text-slate-900">{classifiedUnreconciledExpenses.length}</div>
              <div className="text-sm text-slate-500">expenses</div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Amount</h3>
              <div className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</div>
              <div className="text-sm text-slate-500">to reconcile</div>
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
            title="Expenses Ready for Reconciliation"
            showClassificationStatus={true}
            showDeleteButton={false}
            showMultiSelect={true}
            showCodeColumn={true}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onBulkDeleteExpenses={handleUnclassifyExpenses}
            bulkActionLabel="Unclassify Selected"
            bulkActionIcon={Undo2}
          />
        </div>
      </main>
    </div>
  );
};

export default Reconcile;

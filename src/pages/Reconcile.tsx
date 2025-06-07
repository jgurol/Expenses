
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useSources } from "@/hooks/useSources";
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
  
  const classifiedExpenses = expenses.filter(e => e.classified);
  
  // Get unique source accounts from expenses
  const sourceAccounts = Array.from(new Set(classifiedExpenses.map(e => e.sourceAccount).filter(Boolean)));
  
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

  const handleReconcileAccount = () => {
    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select an account to reconcile",
        variant: "destructive",
      });
      return;
    }

    // Get existing reconciled expenses
    const existingReconciledIds = JSON.parse(localStorage.getItem('reconciledExpenses') || '[]');
    
    // Find expenses for the selected account
    const accountExpenses = classifiedExpenses.filter(expense => expense.sourceAccount === selectedAccount);
    const accountExpenseIds = accountExpenses.map(expense => expense.id);
    
    // Add new expense IDs to existing reconciled expenses
    const updatedReconciledIds = [...new Set([...existingReconciledIds, ...accountExpenseIds])];
    
    // Store updated reconciled expenses
    localStorage.setItem('reconciledExpenses', JSON.stringify(updatedReconciledIds));
    
    toast({
      title: "Account Reconciled",
      description: `Successfully reconciled ${accountExpenses.length} expenses from ${selectedAccount}`,
    });

    // Reset selection
    setSelectedAccount('');
  };

  const handleReconcileAll = () => {
    // Store classified expense IDs in localStorage
    const expenseIds = classifiedExpenses.map(expense => expense.id);
    localStorage.setItem('reconciledExpenses', JSON.stringify(expenseIds));
    
    // Navigate to reconciled page
    navigate('/reconciled');
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
                  disabled={!selectedAccount}
                >
                  <CheckCircle className="h-4 w-4" />
                  Reconcile
                </Button>
              </div>

              <Button
                onClick={handleReconcileAll}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={classifiedExpenses.length === 0}
              >
                <CheckCircle className="h-4 w-4" />
                Mark All as Reconciled ({classifiedExpenses.length})
              </Button>
              
              <Badge variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {classifiedExpenses.length} Ready for Reconciliation
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
              <div className="text-3xl font-bold text-slate-900">{classifiedExpenses.length}</div>
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
            showMultiSelect={false}
            showCodeColumn={true}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </main>
    </div>
  );
};

export default Reconcile;

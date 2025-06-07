
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Undo2, Download, Home, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useSources } from "@/hooks/useSources";
import { useUnreconcileExpenses } from "@/hooks/useUnreconcileExpenses";
import { useArchiveExpenses } from "@/hooks/useArchiveExpenses";
import { ExpensesTable } from "@/components/ExpensesTable";
import { useToast } from "@/hooks/use-toast";
import { exportReconciledExpensesToSpreadsheet } from "@/utils/exportUtils";
import { ExpenseSummaryByCategory } from "@/components/ExpenseSummaryByCategory";

type SortField = 'sourceAccount' | 'date' | 'code';
type SortDirection = 'asc' | 'desc';

const Reconciled = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>('sourceAccount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const { data: expenses = [] } = useExpenses();
  const { data: accountCodes = [] } = useCategories();
  const { data: sources = [] } = useSources();
  const unreconcileExpensesMutation = useUnreconcileExpenses();
  const archiveExpensesMutation = useArchiveExpenses();
  
  // Get reconciled expenses from database (archived expenses are already filtered out by useExpenses)
  const reconciledExpenses = expenses.filter(e => e.reconciled);
  
  // Sort expenses based on current sort state
  const sortedExpenses = [...reconciledExpenses].sort((a, b) => {
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
  
  const totalAmount = reconciledExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const averageExpense = reconciledExpenses.length > 0 ? totalAmount / reconciledExpenses.length : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleUnreconcileExpenses = async (expenseIds: string[]) => {
    try {
      await unreconcileExpensesMutation.mutateAsync(expenseIds);
      toast({
        title: "Success",
        description: `${expenseIds.length} expense${expenseIds.length === 1 ? '' : 's'} unreconciled successfully`,
      });
    } catch (error) {
      console.error('Error unreconciling expenses:', error);
      toast({
        title: "Error",
        description: "Failed to unreconcile expenses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveExpenses = async (expenseIds: string[]) => {
    try {
      await archiveExpensesMutation.mutateAsync(expenseIds);
      toast({
        title: "Success",
        description: `${expenseIds.length} expense${expenseIds.length === 1 ? '' : 's'} archived successfully`,
      });
    } catch (error) {
      console.error('Error archiving expenses:', error);
      toast({
        title: "Error",
        description: "Failed to archive expenses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportToSpreadsheet = () => {
    if (reconciledExpenses.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no reconciled expenses to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      exportReconciledExpensesToSpreadsheet(reconciledExpenses, accountCodes);
      toast({
        title: "Export Successful",
        description: `Exported ${reconciledExpenses.length} reconciled expenses to spreadsheet.`,
      });
    } catch (error) {
      console.error('Error exporting to spreadsheet:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export expenses. Please try again.",
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
                <h1 className="text-2xl font-bold text-slate-900">Reconciled Expenses</h1>
                <p className="text-slate-600">Expenses that have been reconciled</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleExportToSpreadsheet}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white animate-pulse"
                disabled={reconciledExpenses.length === 0}
              >
                <Download className="h-4 w-4" />
                Export to Spreadsheet
              </Button>
              
              <Badge variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {reconciledExpenses.length} Reconciled Expenses
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
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Reconciled</h3>
              <div className="text-3xl font-bold text-slate-900">{reconciledExpenses.length}</div>
              <div className="text-sm text-slate-500">expenses</div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Amount</h3>
              <div className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</div>
              <div className="text-sm text-slate-500">reconciled</div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Average Expense</h3>
              <div className="text-3xl font-bold text-blue-600">${averageExpense.toFixed(2)}</div>
              <div className="text-sm text-slate-500">per transaction</div>
            </Card>
          </div>

          {/* Expense Summary by Category */}
          <ExpenseSummaryByCategory 
            expenses={reconciledExpenses}
            accountCodes={accountCodes}
          />

          {/* Reconciled Expenses Table */}
          <div className="space-y-4">
            <ExpensesTable 
              expenses={sortedExpenses}
              accountCodes={accountCodes}
              sources={sources}
              title="Reconciled Expenses"
              showClassificationStatus={false}
              showDeleteButton={false}
              showMultiSelect={true}
              showCodeColumn={true}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onBulkDeleteExpenses={handleUnreconcileExpenses}
              bulkActionLabel="Unreconcile Selected"
              bulkActionIcon={Undo2}
            />
            
            {/* Archive Button */}
            {reconciledExpenses.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Archive Reconciled Expenses</h3>
                    <p className="text-sm text-slate-600">
                      Archive all reconciled expenses to process a new batch. Archived expenses won't appear in reports or exports.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleArchiveExpenses(reconciledExpenses.map(e => e.id))}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={archiveExpensesMutation.isPending}
                  >
                    <Archive className="h-4 w-4" />
                    Archive All ({reconciledExpenses.length})
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reconciled;

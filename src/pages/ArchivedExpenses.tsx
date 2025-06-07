
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useArchivedExpenses } from "@/hooks/useArchivedExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useSources } from "@/hooks/useSources";
import { ExpensesTable } from "@/components/ExpensesTable";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type SortField = 'sourceAccount' | 'date' | 'code';
type SortDirection = 'asc' | 'desc';

const ArchivedExpenses = () => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('sourceAccount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const { data: archivedExpenses = [] } = useArchivedExpenses();
  const { data: accountCodes = [] } = useCategories();
  const { data: sources = [] } = useSources();
  
  // Group expenses by archived date
  const groupedExpenses = archivedExpenses.reduce((groups, expense) => {
    const archivedDate = expense.archivedAt ? new Date(expense.archivedAt).toDateString() : 'Unknown Date';
    if (!groups[archivedDate]) {
      groups[archivedDate] = [];
    }
    groups[archivedDate].push(expense);
    return groups;
  }, {} as Record<string, typeof archivedExpenses>);

  // Sort each group
  Object.keys(groupedExpenses).forEach(date => {
    groupedExpenses[date] = [...groupedExpenses[date]].sort((a, b) => {
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
  });

  const totalAmount = archivedExpenses.reduce((sum, expense) => sum + expense.spent, 0);
  const averageExpense = archivedExpenses.length > 0 ? totalAmount / archivedExpenses.length : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin']}>
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
                  <h1 className="text-2xl font-bold text-slate-900">Archived Expenses</h1>
                  <p className="text-slate-600">View all archived expenses grouped by archive date</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  {archivedExpenses.length} Archived Expenses
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
                <h3 className="text-sm font-medium text-slate-600 mb-2">Total Archived</h3>
                <div className="text-3xl font-bold text-slate-900">{archivedExpenses.length}</div>
                <div className="text-sm text-slate-500">expenses</div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Total Amount</h3>
                <div className="text-3xl font-bold text-orange-600">${totalAmount.toFixed(2)}</div>
                <div className="text-sm text-slate-500">archived</div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Average Expense</h3>
                <div className="text-3xl font-bold text-blue-600">${averageExpense.toFixed(2)}</div>
                <div className="text-sm text-slate-500">per transaction</div>
              </Card>
            </div>

            {/* Grouped Archived Expenses */}
            <div className="space-y-6">
              {Object.entries(groupedExpenses)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([archivedDate, expenses]) => (
                <div key={archivedDate} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-slate-900">
                      Archived on {archivedDate}
                    </h2>
                    <Badge variant="secondary">
                      {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline">
                      ${expenses.reduce((sum, exp) => sum + exp.spent, 0).toFixed(2)}
                    </Badge>
                  </div>
                  
                  <ExpensesTable 
                    expenses={expenses}
                    accountCodes={accountCodes}
                    sources={sources}
                    title={`Expenses archived on ${archivedDate}`}
                    showClassificationStatus={false}
                    showDeleteButton={false}
                    showMultiSelect={false}
                    showCodeColumn={true}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </div>
              ))}
              
              {Object.keys(groupedExpenses).length === 0 && (
                <Card className="p-12 text-center">
                  <Archive className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Archived Expenses</h3>
                  <p className="text-slate-600">No expenses have been archived yet.</p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ArchivedExpenses;

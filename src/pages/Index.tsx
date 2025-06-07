import { useState, useEffect } from 'react';
import { Plus, UploadCloud, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { useExpenses, useAddExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useClassifyExpense } from '@/hooks/useClassifyExpense';
import { ExpensesTable } from '@/components/ExpensesTable';
import { ExpenseForm } from '@/components/ExpenseForm';
import { CategorySelect } from '@/components/CategorySelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";

export interface AccountCode {
  id: string;
  code: string;
  name: string;
  type: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  spent: number;
  sourceAccount: string;
  classified: boolean;
  reconciled: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedExpenses, setParsedExpenses] = useState<Omit<Expense, 'id'>[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    category: 'Uncategorized',
    spent: 0,
    sourceAccount: 'Checking',
    classified: false,
    reconciled: false
  });
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [selectedAccountCode, setSelectedAccountCode] = useState<string | null>(null);
  
  const { data: expenses = [], refetch: refetchExpenses } = useExpenses();
  const { data: accountCodes = [], refetch: refetchAccountCodes } = useCategories();
  const addExpensesMutation = useAddExpenses();
  const classifyExpenseMutation = useClassifyExpense();

  useEffect(() => {
    refetchExpenses();
    refetchAccountCodes();
  }, [refetchExpenses, refetchAccountCodes]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "Error",
            description: "Error parsing CSV file.",
            variant: "destructive",
          });
          console.error("CSV Parsing Errors:", results.errors);
          return;
        }

        const importedExpenses: Omit<Expense, 'id'>[] = (results.data as any[]).map(row => ({
          date: row.Date,
          description: row.Description,
          category: row.Category || 'Uncategorized',
          spent: parseFloat(row.Amount),
          sourceAccount: row['Source Account'] || 'Checking',
          classified: false,
          reconciled: false
        })).filter(expense => expense.date && expense.description && !isNaN(expense.spent));

        setParsedExpenses(importedExpenses);
        toast({
          title: "Success",
          description: `${importedExpenses.length} expenses parsed from CSV.`,
        });
      },
      error: (error) => {
        toast({
          title: "Error",
          description: "Error parsing CSV file.",
          variant: "destructive",
        });
        console.error("CSV Parsing Error:", error);
      },
    });
  };

  const handleConfirmImport = async () => {
    if (parsedExpenses.length === 0) {
      toast({
        title: "Error",
        description: "No expenses to import.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addExpensesMutation.mutateAsync(parsedExpenses);
      toast({
        title: "Success",
        description: `${parsedExpenses.length} expenses imported successfully.`,
      });
      setIsImportModalOpen(false);
      setCsvFile(null);
      setParsedExpenses([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import expenses.",
        variant: "destructive",
      });
      console.error("Error importing expenses:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = async () => {
    try {
      await addExpensesMutation.mutateAsync([newExpense]);
      toast({
        title: "Success",
        description: "Expense added successfully.",
      });
      setIsAddingExpense(false);
      setNewExpense({
        date: new Date().toISOString().slice(0, 10),
        description: '',
        category: 'Uncategorized',
        spent: 0,
        sourceAccount: 'Checking',
        classified: false,
        reconciled: false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense.",
        variant: "destructive",
      });
      console.error("Error adding expense:", error);
    }
  };

  const handleClassify = async () => {
    if (!selectedExpenseId || !selectedAccountCode) {
      toast({
        title: "Error",
        description: "Please select an expense and an account code.",
        variant: "destructive",
      });
      return;
    }

    try {
      await classifyExpenseMutation.mutateAsync({ expenseId: selectedExpenseId, accountCode: selectedAccountCode });
      toast({
        title: "Success",
        description: "Expense classified successfully.",
      });
      setSelectedExpenseId(null);
      setSelectedAccountCode(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to classify expense.",
        variant: "destructive",
      });
      console.error("Error classifying expense:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Expense Tracker</h1>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate("/analytics")}>
                View Analytics <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => setIsAddingExpense(true)}>
                Add Expense <Plus className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
                Import CSV <UploadCloud className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Import CSV Modal */}
          <AlertDialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Import Expenses from CSV</AlertDialogTitle>
                <AlertDialogDescription>
                  Select a CSV file to import expenses. Ensure the file has columns "Date", "Description", "Category", and "Amount".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    CSV File
                  </Label>
                  <Input type="file" id="csv-file" className="col-span-3" onChange={handleFileChange} />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setIsImportModalOpen(false);
                  setCsvFile(null);
                }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleImport}>Import</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Confirm Import Modal */}
          <AlertDialog open={parsedExpenses.length > 0} onOpenChange={() => setParsedExpenses([])}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Import</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to import these expenses?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <p>Importing {parsedExpenses.length} expenses.</p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setParsedExpenses([])}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmImport}>Confirm Import</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add Expense Form */}
          <AlertDialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Expense</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter the details for the new expense.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <ExpenseForm expense={newExpense} onChange={handleInputChange} />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsAddingExpense(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddExpense}>Add Expense</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Classify Expense Section */}
          <Card>
            <CardHeader>
              <CardTitle>Classify Expense</CardTitle>
              <CardDescription>Select an expense and an account code to classify it.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense">Select Expense</Label>
                  <select
                    id="expense"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedExpenseId || ''}
                    onChange={(e) => setSelectedExpenseId(e.target.value)}
                  >
                    <option value="">Select an expense</option>
                    {expenses
                      .filter(expense => !expense.classified)
                      .map((expense) => (
                        <option key={expense.id} value={expense.id}>
                          {expense.description} - ${expense.spent.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="accountCode">Select Account Code</Label>
                  <CategorySelect
                    accountCodes={accountCodes}
                    value={selectedAccountCode || ''}
                    onChange={(e) => setSelectedAccountCode(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleClassify} disabled={!selectedExpenseId || !selectedAccountCode}>
                Classify Expense
              </Button>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <ExpensesTable expenses={expenses} accountCodes={accountCodes} />
        </div>
      </main>
    </div>
  );
};

export default Index;

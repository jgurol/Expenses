
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar, DollarSign, FileText, ChevronRight } from "lucide-react";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpenseClassifierProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
  onExpenseClassified: (expenseId: string, accountCode: string) => void;
}

export const ExpenseClassifier = ({ expenses, accountCodes, onExpenseClassified }: ExpenseClassifierProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>("");

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <FileText className="h-12 w-12 text-slate-400" />
          <div>
            <h3 className="text-lg font-medium text-slate-700">No expenses to classify</h3>
            <p className="text-slate-500">Upload a spreadsheet to get started</p>
          </div>
        </div>
      </Card>
    );
  }

  const currentExpense = expenses[currentIndex];
  const progress = ((currentIndex + 1) / expenses.length) * 100;

  const handleClassify = () => {
    if (!selectedAccountCode) {
      toast({
        title: "Please select an account",
        description: "Choose an account code to classify this expense",
        variant: "destructive",
      });
      return;
    }

    onExpenseClassified(currentExpense.id, selectedAccountCode);
    setSelectedAccountCode("");
    
    if (currentIndex < expenses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: "All expenses classified!",
        description: "Great job! All expenses have been processed.",
      });
    }
  };

  const handleSkip = () => {
    if (currentIndex < expenses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span>{currentIndex + 1} of {expenses.length}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Expense Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              Expense #{currentIndex + 1}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ${currentExpense.spent.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Date</p>
                <p className="font-medium text-slate-900">{currentExpense.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Category</p>
                <p className="font-medium text-slate-900">{currentExpense.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Amount</p>
                <p className="font-medium text-slate-900">${currentExpense.spent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/80 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Description</p>
            <p className="font-medium text-slate-900">{currentExpense.description}</p>
          </div>
        </div>
      </Card>

      {/* Classification Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">Classify This Expense</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Account Code
            </label>
            <Select value={selectedAccountCode} onValueChange={setSelectedAccountCode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an account code..." />
              </SelectTrigger>
              <SelectContent>
                {accountCodes.map((code) => (
                  <SelectItem key={code.id} value={code.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{code.code}</Badge>
                      <span>{code.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={currentIndex === expenses.length - 1}
            >
              Skip
            </Button>
            
            <Button
              onClick={handleClassify}
              className="flex-1 flex items-center gap-2"
              disabled={!selectedAccountCode}
            >
              Classify Expense
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

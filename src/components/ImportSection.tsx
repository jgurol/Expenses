
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { ExpensesTable } from "@/components/ExpensesTable";
import type { Expense, AccountCode } from "@/pages/Index";

interface ImportSectionProps {
  importedExpenses: Expense[];
  accountCodes: AccountCode[];
  onExpensesUploaded: (expenses: Expense[]) => void;
  onDeleteImportedExpense: (expenseId: string) => void;
  onBulkDeleteImportedExpenses: (expenseIds: string[]) => void;
  onSaveImportedExpenses: () => void;
  onClearImportedExpenses: () => void;
  isSaving: boolean;
}

export const ImportSection = ({
  importedExpenses,
  accountCodes,
  onExpensesUploaded,
  onDeleteImportedExpense,
  onBulkDeleteImportedExpenses,
  onSaveImportedExpenses,
  onClearImportedExpenses,
  isSaving
}: ImportSectionProps) => {
  return (
    <div className="space-y-8">
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Upload Expenses</h2>
        <FileUpload onExpensesUploaded={onExpensesUploaded} />
      </Card>

      {importedExpenses.length > 0 && (
        <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Review Imported Expenses
              <Badge variant="secondary" className="ml-2">
                {importedExpenses.length} expenses
              </Badge>
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onClearImportedExpenses}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
              <Button
                onClick={onSaveImportedExpenses}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save to Database"}
              </Button>
            </div>
          </div>
          <ExpensesTable 
            expenses={importedExpenses}
            accountCodes={accountCodes}
            title=""
            showClassificationStatus={false}
            showDeleteButton={true}
            showMultiSelect={true}
            onDeleteExpense={onDeleteImportedExpense}
            onBulkDeleteExpenses={onBulkDeleteImportedExpenses}
          />
        </Card>
      )}
    </div>
  );
};

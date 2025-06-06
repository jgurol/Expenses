
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const ExpenseTableEmpty = () => {
  return (
    <Card className="p-8 text-center bg-slate-50">
      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-700 mb-2">No expenses to display</h3>
      <p className="text-slate-500">Expenses will appear here once they are uploaded</p>
    </Card>
  );
};

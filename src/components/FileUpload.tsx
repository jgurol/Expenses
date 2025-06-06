import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { Expense } from "@/pages/Index";

interface FileUploadProps {
  onExpensesUploaded: (expenses: Expense[]) => void;
}

export const FileUpload = ({ onExpensesUploaded }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const processFileData = (data: any[], accountName?: string) => {
    const expenses: Expense[] = data
      .filter(row => row.date && row.description && (row.spent || row.amount))
      .map(row => ({
        id: generateId(),
        date: row.date || row.Date || "",
        description: row.description || row.Description || "",
        category: row.category || row.Category || "Uncategorized",
        spent: parseFloat(row.spent || row.Spent || row.amount || row.Amount || "0"),
        accountCode: accountName || "Unknown",
        classified: false,
      }));

    return expenses;
  };

  const handleFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const expenses = processFileData(results.data, "CSV Import");
            onExpensesUploaded(expenses);
            toast({
              title: "Success!",
              description: `Uploaded ${expenses.length} expenses from CSV`,
            });
          },
          error: (error) => {
            toast({
              title: "Error",
              description: "Failed to parse CSV file",
              variant: "destructive",
            });
          }
        });
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        
        let allExpenses: Expense[] = [];
        let totalProcessed = 0;
        
        // Process each sheet/tab as a separate account
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          
          if (data.length > 0) {
            const expenses = processFileData(data, sheetName);
            allExpenses = [...allExpenses, ...expenses];
            totalProcessed += expenses.length;
            
            console.log(`Processed ${expenses.length} expenses from sheet: ${sheetName}`);
          }
        });
        
        if (allExpenses.length > 0) {
          onExpensesUploaded(allExpenses);
          toast({
            title: "Success!",
            description: `Uploaded ${totalProcessed} expenses from ${workbook.SheetNames.length} accounts`,
          });
        } else {
          toast({
            title: "Warning",
            description: "No valid expense data found in any sheets",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Please upload a CSV or Excel file",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("File processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onExpensesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragOver
            ? "border-blue-400 bg-blue-50 scale-105"
            : "border-slate-300 bg-slate-50 hover:border-slate-400"
        } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${isDragOver ? "bg-blue-100" : "bg-slate-100"} transition-colors`}>
              <Upload className={`h-8 w-8 ${isDragOver ? "text-blue-600" : "text-slate-600"}`} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {isProcessing ? "Processing..." : "Drop your spreadsheet here"}
              </h3>
              <p className="text-slate-600 mb-4">
                Supports CSV, Excel (.xlsx, .xls) files
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Expected columns: date, description, category, spent/amount
              </p>
              <p className="text-sm text-blue-600 font-medium">
                Excel files: Each tab represents a different account
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={isProcessing}
              >
                Choose File
              </Button>
            </div>

            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </Card>

      {uploadedFile && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{uploadedFile.name}</p>
                <p className="text-sm text-green-700">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

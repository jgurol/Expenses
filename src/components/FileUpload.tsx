import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateFileUpload, sanitizeInput } from '@/utils/authCleanup';
import type { Expense } from '@/pages/Index';

interface FileUploadProps {
  onExpensesUploaded: (expenses: Expense[]) => void;
}

export const FileUpload = ({ onExpensesUploaded }: FileUploadProps) => {
  const [error, setError] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const processCSVFile = async (file: File): Promise<Expense[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV file must contain at least a header and one data row'));
            return;
          }

          const headers = lines[0].split(',').map(h => sanitizeInput(h.toLowerCase().trim()));
          const expenses: Expense[] = [];

          // Validate required headers - updated to new requirements
          const requiredHeaders = ['date', 'description', 'categories', 'spent'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => sanitizeInput(v.trim()));
            
            if (values.length !== headers.length) {
              console.warn(`Skipping row ${i + 1}: column count mismatch`);
              continue;
            }

            const row: { [key: string]: string } = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            // Validate and parse the row - updated to use new column names
            const dateStr = row.date;
            const description = row.description;
            const spentStr = row.spent;
            const category = row.categories || 'Unclassified';
            const sourceAccount = row.sourceaccount || row['source account'] || 'Unknown';

            // Security: Validate required fields
            if (!dateStr || !description || !spentStr) {
              console.warn(`Skipping row ${i + 1}: missing required data`);
              continue;
            }

            // Security: Validate date format
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              console.warn(`Skipping row ${i + 1}: invalid date format`);
              continue;
            }

            // Security: Validate spent is a number
            const spent = parseFloat(spentStr.replace(/[^0-9.-]/g, ''));
            if (isNaN(spent)) {
              console.warn(`Skipping row ${i + 1}: invalid spent amount`);
              continue;
            }

            expenses.push({
              id: `temp-${Date.now()}-${i}`,
              date: date.toISOString().split('T')[0],
              description: description.substring(0, 500), // Limit description length
              category: category.substring(0, 100), // Limit category length
              spent: Math.abs(spent), // Ensure positive amount
              sourceAccount: sourceAccount.substring(0, 100), // Limit source account length
              classified: false,
              reconciled: false
            });
          }

          if (expenses.length === 0) {
            reject(new Error('No valid expense records found in the file'));
            return;
          }

          resolve(expenses);
        } catch (error) {
          reject(new Error('Failed to parse CSV file: ' + (error as Error).message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError('');
    setIsProcessing(true);

    try {
      // Security: Validate file upload
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      const expenses = await processCSVFile(file);
      
      // Security: Limit the number of expenses that can be uploaded at once
      if (expenses.length > 1000) {
        setError('File contains too many records. Maximum 1000 expenses per upload.');
        return;
      }

      onExpensesUploaded(expenses);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, [onExpensesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="space-y-4">
      <Card 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 hover:border-slate-400'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-slate-600">Processing file...</p>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Upload className="h-8 w-8 text-slate-400" />
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-900">
                  {isDragActive ? 'Drop the file here' : 'Upload CSV File'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Drag and drop or click to select a CSV file (max 10MB)
                </p>
              </div>
              <Button variant="outline" disabled={isProcessing}>
                Choose File
              </Button>
            </>
          )}
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-slate-500 space-y-1">
        <p><strong>Required columns:</strong> date, description, categories, spent</p>
        <p><strong>Optional columns:</strong> sourceaccount (or "source account")</p>
        <p><strong>Security:</strong> Files are processed locally and validated for safety</p>
      </div>
    </div>
  );
};

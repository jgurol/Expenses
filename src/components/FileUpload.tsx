import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateFileUpload, sanitizeInput } from '@/utils/authCleanup';
import * as XLSX from 'xlsx';
import type { Expense } from '@/pages/Index';

interface FileUploadProps {
  onExpensesUploaded: (expenses: Expense[]) => void;
}

export const FileUpload = ({ onExpensesUploaded }: FileUploadProps) => {
  const [error, setError] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const parseDate = (dateValue: any): Date => {
    // Handle empty or null values
    if (!dateValue) {
      return new Date();
    }

    // Convert to string for processing
    const dateStr = String(dateValue).trim();
    
    // Handle Excel serial date numbers
    if (typeof dateValue === 'number' && dateValue > 1) {
      // Excel serial date: days since January 1, 1900
      // Excel incorrectly treats 1900 as a leap year, so we subtract 2 days total
      const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
      const days = dateValue - 2; // Subtract 2: 1 for Excel's 1-based indexing + 1 for the leap year bug
      const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try parsing as a regular date string
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Try common date formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or M/D/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // MM/DD/YY or M/D/YY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let year, month, day;
        
        if (format.source.includes('YYYY')) {
          if (format.source.startsWith('^(\\d{4})')) {
            // YYYY-MM-DD format
            year = parseInt(match[1]);
            month = parseInt(match[2]) - 1; // Month is 0-indexed
            day = parseInt(match[3]);
          } else {
            // MM/DD/YYYY format
            month = parseInt(match[1]) - 1; // Month is 0-indexed
            day = parseInt(match[2]);
            year = parseInt(match[3]);
          }
        } else {
          // MM/DD/YY format - assume 20xx for years 00-29, 19xx for 30-99
          month = parseInt(match[1]) - 1; // Month is 0-indexed
          day = parseInt(match[2]);
          const shortYear = parseInt(match[3]);
          year = shortYear <= 29 ? 2000 + shortYear : 1900 + shortYear;
        }

        const constructedDate = new Date(year, month, day);
        if (!isNaN(constructedDate.getTime()) && year >= 1900 && year <= 2100) {
          return constructedDate;
        }
      }
    }

    // Fallback to current date
    console.warn(`Could not parse date: ${dateStr}, using current date`);
    return new Date();
  };

  const processExcelFile = async (file: File): Promise<Expense[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const allExpenses: Expense[] = [];
          
          // Process each sheet/tab
          workbook.SheetNames.forEach((sheetName, sheetIndex) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            if (jsonData.length < 2) {
              console.warn(`Sheet "${sheetName}" has no data, skipping`);
              return;
            }
            
            // Use the sheet name as the source account
            const sourceAccount = sheetName.trim();
            
            // Get headers from first row and normalize them
            const headers = (jsonData[0] || []).map(h => 
              sanitizeInput(String(h || '').toLowerCase().trim())
            );
            
            // Process data rows
            for (let i = 1; i < jsonData.length; i++) {
              const values = jsonData[i] || [];
              
              // Create row object
              const row: { [key: string]: any } = {};
              headers.forEach((header, index) => {
                row[header] = values[index];
              });
              
              // Flexible column mapping - handle various header names
              const dateValue = row.date || row.a || '';
              const description = sanitizeInput(String(row.description || row.desc || row.transaction || row.b || 'Unknown').trim());
              const spentStr = String(row.spent || row.amount || row.value || row.d || '0');
              
              // Handle category column - look for "categorize", "match", "category", or column C
              const category = sanitizeInput(String(row.categories || row.category || row.categorize || row.match || 
                             row['categorize or match'] || row.c || 'Unclassified').trim());

              // Skip rows without essential data
              if (!dateValue && !description) {
                console.warn(`Skipping row ${i + 1} in sheet "${sheetName}": no meaningful data found`);
                continue;
              }

              // Parse date with improved handling
              const date = parseDate(dateValue);

              // Parse spent amount with fallback
              const spent = parseFloat(String(spentStr).replace(/[^0-9.-]/g, '')) || 0;

              allExpenses.push({
                id: `temp-${Date.now()}-${sheetIndex}-${i}`,
                date: date.toISOString().split('T')[0],
                description: description.substring(0, 500),
                category: category.substring(0, 100),
                spent: Math.abs(spent),
                sourceAccount: sourceAccount.substring(0, 100),
                classified: false,
                reconciled: false
              });
            }
          });

          if (allExpenses.length === 0) {
            reject(new Error('No valid expense records found in any sheets'));
            return;
          }

          resolve(allExpenses);
        } catch (error) {
          reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

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
          
          // For CSV files, use filename as source account
          const sourceAccount = file.name.replace(/\.(csv|xlsx?|xls)$/i, '').trim() || 'Unknown';

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

            // Flexible column mapping - handle various header names
            const dateValue = row.date || row.a || '';
            const description = row.description || row.desc || row.transaction || row.b || 'Unknown';
            const spentStr = row.spent || row.amount || row.value || row.d || '0';
            
            // Handle category column - look for "categorize", "match", "category", or column C
            const category = row.categories || row.category || row.categorize || row.match || 
                           row['categorize or match'] || row.c || 'Unclassified';

            // Skip rows without essential data
            if (!dateValue && !description) {
              console.warn(`Skipping row ${i + 1}: no meaningful data found`);
              continue;
            }

            // Parse date with improved handling
            const date = parseDate(dateValue);

            // Parse spent amount with fallback
            const spent = parseFloat(spentStr.replace(/[^0-9.-]/g, '')) || 0;

            expenses.push({
              id: `temp-${Date.now()}-${i}`,
              date: date.toISOString().split('T')[0],
              description: description.substring(0, 500),
              category: category.substring(0, 100),
              spent: Math.abs(spent),
              sourceAccount: sourceAccount.substring(0, 100),
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

      let expenses: Expense[] = [];
      
      // Process based on file type
      if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        expenses = await processExcelFile(file);
      } else {
        expenses = await processCSVFile(file);
      }
      
      // Security: Limit the number of expenses that can be uploaded at once
      if (expenses.length > 1000) {
        setError('File contains too many records. Maximum 1000 expenses per upload.');
        return;
      }

      console.log(`Processed ${expenses.length} expenses from file`);
      onExpensesUploaded(expenses);
    } catch (error) {
      console.error('File processing error:', error);
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
                  {isDragActive ? 'Drop the file here' : 'Upload CSV or Excel File'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Drag and drop or click to select a file (max 10MB)
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
        <p><strong>Excel files:</strong> Each sheet/tab name becomes the source account</p>
        <p><strong>CSV files:</strong> Filename becomes the source account</p>
        <p><strong>Expected columns:</strong> Date, Description, Categories, Amount/Spent</p>
        <p><strong>Security:</strong> Files are processed locally and validated for safety</p>
      </div>
    </div>
  );
};

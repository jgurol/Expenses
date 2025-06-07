import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateFileUpload, sanitizeInput } from '@/utils/authCleanup';
import { useSources } from '@/hooks/useSources';
import type { Expense } from '@/pages/Index';

interface FileUploadProps {
  onExpensesUploaded: (expenses: Expense[]) => void;
}

export const FileUpload = ({ onExpensesUploaded }: FileUploadProps) => {
  const [error, setError] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { data: sources = [] } = useSources();

  // Function to match sheet tab name with source account
  const matchSourceAccount = (tabName: string) => {
    if (!tabName) return 'Unknown';
    
    const normalizedTabName = tabName.toLowerCase().trim();
    
    // Try to find exact match first
    let matchedSource = sources.find(source => 
      source.name.toLowerCase() === normalizedTabName ||
      source.account_number.toLowerCase() === normalizedTabName
    );
    
    // If no exact match, try partial matching
    if (!matchedSource) {
      matchedSource = sources.find(source =>
        normalizedTabName.includes(source.name.toLowerCase()) ||
        source.name.toLowerCase().includes(normalizedTabName) ||
        normalizedTabName.includes(source.account_number.toLowerCase()) ||
        source.account_number.toLowerCase().includes(normalizedTabName)
      );
    }
    
    return matchedSource ? matchedSource.name : 'Unknown';
  };

  // Column mapping for loose matching
  const getColumnMapping = (headers: string[]) => {
    const mapping: { [key: string]: string } = {};
    
    // Define column aliases for loose matching
    const columnAliases = {
      date: ['date', 'transaction date', 'trans date', 'expense date'],
      description: ['description', 'desc', 'details', 'memo', 'transaction description', 'payee'],
      amount: ['amount', 'spent', 'cost', 'expense', 'value', 'total', 'sum'],
      category: ['category', 'cat', 'type', 'expense type', 'classification'],
      sourceaccount: ['sourceaccount', 'source account', 'account', 'bank account', 'source', 'from account']
    };

    // Match headers to standard column names
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      
      for (const [standardColumn, aliases] of Object.entries(columnAliases)) {
        if (aliases.some(alias => normalizedHeader.includes(alias) || alias.includes(normalizedHeader))) {
          mapping[header] = standardColumn;
          break;
        }
      }
    });

    return mapping;
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

          const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const columnMapping = getColumnMapping(rawHeaders);
          
          console.log('Column mapping:', columnMapping);
          console.log('Available sources:', sources);
          
          // Try to determine source account from file name or sheet tab
          const fileName = file.name.replace(/\.(csv|xlsx?)$/i, '');
          const detectedSourceAccount = matchSourceAccount(fileName);
          console.log('Detected source account from file name:', detectedSourceAccount);
          
          const expenses: Expense[] = [];

          // Check if we have the required mappings
          const requiredMappings = ['date', 'description', 'amount'];
          const foundMappings = Object.values(columnMapping);
          const missingMappings = requiredMappings.filter(req => !foundMappings.includes(req));
          
          if (missingMappings.length > 0) {
            const availableColumns = rawHeaders.join(', ');
            reject(new Error(`Could not find columns for: ${missingMappings.join(', ')}. Available columns: ${availableColumns}`));
            return;
          }

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => sanitizeInput(v.trim().replace(/"/g, '')));
            
            if (values.length !== rawHeaders.length) {
              console.warn(`Skipping row ${i + 1}: column count mismatch`);
              continue;
            }

            // Build row data using column mapping
            const rowData: { [key: string]: string } = {};
            rawHeaders.forEach((header, index) => {
              const mappedColumn = columnMapping[header];
              if (mappedColumn) {
                rowData[mappedColumn] = values[index] || '';
              }
            });

            // Extract required fields
            const dateStr = rowData.date;
            const description = rowData.description;
            const amountStr = rowData.amount;
            const category = rowData.category || 'Unclassified';
            
            // Use detected source account or try to match from row data
            let sourceAccount = detectedSourceAccount;
            if (rowData.sourceaccount) {
              sourceAccount = matchSourceAccount(rowData.sourceaccount);
            }

            // Security: Validate required fields
            if (!dateStr || !description || !amountStr) {
              console.warn(`Skipping row ${i + 1}: missing required data`);
              continue;
            }

            // Security: Validate date format
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              console.warn(`Skipping row ${i + 1}: invalid date format`);
              continue;
            }

            // Security: Validate amount is a number
            const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, ''));
            if (isNaN(amount)) {
              console.warn(`Skipping row ${i + 1}: invalid amount`);
              continue;
            }

            expenses.push({
              id: `temp-${Date.now()}-${i}`,
              date: date.toISOString().split('T')[0],
              description: description.substring(0, 500), // Limit description length
              category: category.substring(0, 100), // Limit category length
              spent: Math.abs(amount), // Ensure positive amount
              sourceAccount: sourceAccount.substring(0, 100), // Limit source account length
              classified: false,
              reconciled: false
            });
          }

          if (expenses.length === 0) {
            reject(new Error('No valid expense records found in the file'));
            return;
          }

          console.log('Processed expenses with source accounts:', expenses.map(e => ({ description: e.description, sourceAccount: e.sourceAccount })));
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
  }, [onExpensesUploaded, sources]);

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
        <p><strong>Flexible column matching:</strong> Headers like "spent", "amount", "cost" will be recognized as amount fields</p>
        <p><strong>Source account matching:</strong> File names and sheet tabs will be matched to your configured sources</p>
        <p><strong>Required data:</strong> date, description, and amount (with flexible column names)</p>
        <p><strong>Optional:</strong> category, source account (will use defaults if not found)</p>
        <p><strong>Security:</strong> Files are processed locally and validated for safety</p>
      </div>
    </div>
  );
};

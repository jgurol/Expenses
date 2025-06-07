
import * as XLSX from 'xlsx';
import type { Expense, AccountCode } from '@/pages/Index';

export const exportReconciledExpensesToSpreadsheet = (expenses: Expense[], accountCodes: AccountCode[]) => {
  // Group expenses by source account
  const expensesByAccount = expenses.reduce((acc, expense) => {
    const account = expense.sourceAccount || 'Unknown';
    if (!acc[account]) {
      acc[account] = [];
    }
    acc[account].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Create a sheet for each account
  Object.entries(expensesByAccount).forEach(([account, accountExpenses]) => {
    // Sort expenses by date
    const sortedExpenses = accountExpenses.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Prepare data for the sheet
    const sheetData = sortedExpenses.map(expense => {
      const accountCode = accountCodes.find(code => code.name === expense.category);
      return {
        Date: expense.date,
        Description: expense.description,
        Code: accountCode?.code || '',
        Category: expense.category,
        Spent: expense.spent
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sheetData);

    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 40 }, // Description
      { wch: 8 },  // Code
      { wch: 20 }, // Category
      { wch: 12 }  // Spent
    ];
    worksheet['!cols'] = colWidths;

    // Add the worksheet to the workbook with account name as sheet name
    // Sanitize sheet name (Excel has limitations on sheet names)
    const sanitizedSheetName = account.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedSheetName);
  });

  // Generate filename with current date
  const today = new Date().toISOString().split('T')[0];
  const filename = `reconciled-expenses-${today}.xlsx`;

  // Write and download the file
  XLSX.writeFile(workbook, filename);
};

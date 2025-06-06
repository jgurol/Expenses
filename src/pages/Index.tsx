import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { ExpenseClassifier } from "@/components/ExpenseClassifier";
import { ChartOfAccounts } from "@/components/ChartOfAccounts";
import { ExpensesDashboard } from "@/components/ExpensesDashboard";

export type UserRole = "bookkeeper" | "classifier";

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  spent: number;
  accountCode?: string;
  classified: boolean;
}

export interface AccountCode {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense" | "transfer" | "payment" | "shareholder loan";
}

const Index = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("bookkeeper");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accountCodes, setAccountCodes] = useState<AccountCode[]>([
    { id: "1", code: "6110.1", name: "Circuits EOF-COGS", type: "expense" },
    { id: "2", code: "6110.2", name: "Circuits BB-COGS", type: "expense" },
    { id: "3", code: "6110.3", name: "Circuits WL-COGS", type: "expense" },
    { id: "4", code: "6110.4", name: "Circuits EOC-COGS", type: "expense" },
    { id: "5", code: "6110.5", name: "Circuits T1-COGS", type: "expense" },
    { id: "6", code: "6110.6", name: "Circuits 4G LTE-COGS", type: "expense" },
    { id: "7", code: "6110.7", name: "Circuits SDWAN-COGS", type: "expense" },
    { id: "8", code: "6120.1", name: "Voice Services-COGS", type: "expense" },
    { id: "9", code: "6130.01", name: "Datacenter - Infrastructure-COGS", type: "expense" },
    { id: "10", code: "6130.02", name: "Datacenter - Customer-COGS", type: "expense" },
    { id: "11", code: "6140", name: "Backup-COGS", type: "expense" },
    { id: "12", code: "6160.02", name: "SDWAN-COGS", type: "expense" },
    { id: "13", code: "6200", name: "Hardware - COGS-COGS", type: "expense" },
    { id: "14", code: "6210", name: "Hardware Leases - COGS-COGS", type: "expense" },
    { id: "15", code: "6300", name: "Software - COGS-COGS", type: "expense" },
    { id: "16", code: "6400", name: "Cabling and Installation-COGS", type: "expense" },
    { id: "17", code: "6500", name: "Consulting-COGS", type: "expense" },
    { id: "18", code: "6600", name: "Customer Support-COGS", type: "expense" },
    { id: "19", code: "6800", name: "Shipping Expense-COGS", type: "expense" },
    { id: "20", code: "7200", name: "Hardware Expenses-Expenses", type: "expense" },
    { id: "21", code: "7210", name: "Server and Routers-Expenses", type: "expense" },
    { id: "22", code: "7220", name: "Computer Hardware-Expenses", type: "expense" },
    { id: "23", code: "7230", name: "Server Backup-Expenses", type: "expense" },
    { id: "24", code: "7300", name: "Software-Expenses", type: "expense" },
    { id: "25", code: "8010", name: "Sales and marketing-Expenses", type: "expense" },
    { id: "26", code: "8011", name: "Commissions & Fees-Expenses", type: "expense" },
    { id: "27", code: "8030.1", name: "Legal Fees-Expenses", type: "expense" },
    { id: "28", code: "8030.2", name: "Other Consulting Fees-Expenses", type: "expense" },
    { id: "29", code: "8030.3", name: "Accounting Fees-Expenses", type: "expense" },
    { id: "30", code: "8030.4", name: "Oversea Consultation-Expenses", type: "expense" },
    { id: "31", code: "8040", name: "Office Expenses-Expenses", type: "expense" },
    { id: "32", code: "8050", name: "Rent-Expenses", type: "expense" },
    { id: "33", code: "8060.1", name: "Employee Meal Expense Reimbursement-Expenses", type: "expense" },
    { id: "34", code: "8060.2", name: "Employee Phone Expense Reimbursement-Expenses", type: "expense" },
    { id: "35", code: "8060.3", name: "Employee Travel Expense Reimbursement-Expenses", type: "expense" },
    { id: "36", code: "8060.4", name: "Hotel & Airfare-Expenses", type: "expense" },
    { id: "37", code: "8060.5", name: "Meals 100% - Staff Meetings-Expenses", type: "expense" },
    { id: "38", code: "8060.6", name: "Taxis, Parking and Limousine-Expenses", type: "expense" },
    { id: "39", code: "8060.7", name: "Trade Shows & Conferences-Expenses", type: "expense" },
    { id: "40", code: "8060.80", name: "Meals 50% - Client-Expenses", type: "expense" },
    { id: "41", code: "8070.1", name: "Administrative Service Fees-Expenses", type: "expense" },
    { id: "42", code: "8070.3", name: "Finance Charges-Expenses", type: "expense" },
    { id: "43", code: "8070.3", name: "Late Fees-Expenses", type: "expense" },
    { id: "44", code: "8070.4", name: "Paypal Fees-Expenses", type: "expense" },
    { id: "45", code: "8080.1", name: "Auto - Car Wash-Expenses", type: "expense" },
    { id: "46", code: "8080.2", name: "Auto - Gas-Expenses", type: "expense" },
    { id: "47", code: "8080.3", name: "Auto - License & Registrati-Expenses", type: "expense" },
    { id: "48", code: "8080.4", name: "Auto - Repairs and Maintenance-Expenses", type: "expense" },
    { id: "49", code: "8090.1", name: "Utilities - Alarm-Expenses", type: "expense" },
    { id: "50", code: "8090.2", name: "Utilities-Telephone-Expenses", type: "expense" },
    { id: "51", code: "8090.3", name: "Utilities-Electric-Expenses", type: "expense" },
    { id: "52", code: "8090.4", name: "Utilities-Internet Access-Expenses", type: "expense" },
    { id: "53", code: "8090.5", name: "Utilities-Water & Trash-Expenses", type: "expense" },
    { id: "54", code: "8100", name: "Cleaning services-Expenses", type: "expense" },
    { id: "55", code: "8110", name: "Taxes & Licenses-Expenses", type: "expense" },
    { id: "56", code: "8130", name: "Dues & Subscriptions-Expenses", type: "expense" },
    { id: "57", code: "9100", name: "Donations / Charities-Expenses", type: "expense" },
    { id: "58", code: "9200", name: "EE Education & Training Expense-Expenses", type: "expense" },
    { id: "59", code: "SHARE", name: "Shareholder", type: "equity" },
    { id: "60", code: "TRANSFER", name: "Transfer to business savings account", type: "asset" },
    { id: "61", code: "VENTURE", name: "Venture X 6069 Payment - See that tab", type: "liability" },
    { id: "62", code: "AMEX1", name: "AMEX Payment - See that tab", type: "liability" },
    { id: "63", code: "AMEX2", name: "AMEX Payment - AMEX ending 1002", type: "liability" },
  ]);

  const handleExpensesUploaded = (newExpenses: Expense[]) => {
    setExpenses(prev => [...prev, ...newExpenses]);
  };

  const handleExpenseClassified = (expenseId: string, accountCode: string) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, accountCode, classified: true }
          : expense
      )
    );
  };

  const handleAccountCodesUpdate = (updatedCodes: AccountCode[]) => {
    setAccountCodes(updatedCodes);
  };

  const unclassifiedExpenses = expenses.filter(e => !e.classified);
  const classifiedExpenses = expenses.filter(e => e.classified);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Expense Manager</h1>
              <p className="text-slate-600">Streamline your business expense classification</p>
            </div>
            
            {/* Role Switch */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Current Role:</span>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <Button
                  variant={currentRole === "bookkeeper" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentRole("bookkeeper")}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Bookkeeper
                </Button>
                <Button
                  variant={currentRole === "classifier" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentRole("classifier")}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Classifier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Badge variant="outline" className="mb-4">
            {currentRole === "bookkeeper" ? "Bookkeeper View" : "Expense Classifier View"}
          </Badge>
          
          {currentRole === "bookkeeper" ? (
            <div className="space-y-8">
              <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Upload Expenses</h2>
                <FileUpload onExpensesUploaded={handleExpensesUploaded} />
              </Card>

              <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Chart of Accounts</h2>
                <ChartOfAccounts 
                  accountCodes={accountCodes}
                  onAccountCodesUpdate={handleAccountCodesUpdate}
                />
              </Card>

              <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Expenses Overview</h2>
                <ExpensesDashboard 
                  expenses={expenses}
                  accountCodes={accountCodes}
                />
              </Card>
            </div>
          ) : (
            <div className="space-y-8">
              <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">
                  Classify Expenses 
                  <Badge variant="secondary" className="ml-2">
                    {unclassifiedExpenses.length} pending
                  </Badge>
                </h2>
                <ExpenseClassifier
                  expenses={unclassifiedExpenses}
                  accountCodes={accountCodes}
                  onExpenseClassified={handleExpenseClassified}
                />
              </Card>

              {classifiedExpenses.length > 0 && (
                <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900">Classified Expenses</h2>
                  <ExpensesDashboard 
                    expenses={classifiedExpenses}
                    accountCodes={accountCodes}
                  />
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;

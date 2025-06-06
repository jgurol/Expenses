
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, FileText, Calendar } from "lucide-react";
import type { Expense, AccountCode } from "@/pages/Index";

interface ExpensesDashboardProps {
  expenses: Expense[];
  accountCodes: AccountCode[];
}

export const ExpensesDashboard = ({ expenses, accountCodes }: ExpensesDashboardProps) => {
  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center bg-slate-50">
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">No expenses to display</h3>
        <p className="text-slate-500">Expenses will appear here once they are uploaded and classified</p>
      </Card>
    );
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.spent, 0);
  const averageAmount = totalAmount / expenses.length;
  
  // Group by account code
  const expensesByAccount = expenses.reduce((acc, expense) => {
    if (expense.accountCode) {
      const account = accountCodes.find(code => code.id === expense.accountCode);
      const accountName = account ? `${account.code} - ${account.name}` : 'Unknown';
      acc[accountName] = (acc[accountName] || 0) + expense.spent;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByAccount).map(([name, amount]) => ({
    name,
    amount,
  }));

  // Group by month for trend analysis
  const expensesByMonth = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + expense.spent;
    return acc;
  }, {} as Record<string, number>);

  const trendData = Object.entries(expensesByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month,
      amount,
    }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-200 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Total Amount</p>
              <p className="text-xl font-bold text-blue-900">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-green-700">Average</p>
              <p className="text-xl font-bold text-green-900">${averageAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-200 rounded-lg">
              <FileText className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-purple-700">Total Items</p>
              <p className="text-xl font-bold text-purple-900">{expenses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-200 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <p className="text-sm text-orange-700">Classified</p>
              <p className="text-xl font-bold text-orange-900">
                {expenses.filter(e => e.classified).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Expenses by Account</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Monthly Trend */}
      {trendData.length > 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
              />
              <Bar dataKey="amount" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Expense List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">Recent Expenses</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {expenses.slice(0, 10).map((expense) => {
            const account = accountCodes.find(code => code.id === expense.accountCode);
            return (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-900">{expense.description}</p>
                    {expense.classified && (
                      <Badge variant="secondary" className="text-xs">
                        Classified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{expense.date}</span>
                    <span>{expense.category}</span>
                    {account && (
                      <Badge variant="outline" className="text-xs">
                        {account.code} - {account.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">${expense.spent.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

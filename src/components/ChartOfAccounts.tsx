import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, DollarSign, Loader2 } from "lucide-react";
import type { AccountCode } from "@/pages/Index";
import { useAccountCodes, useAddAccountCode, useUpdateAccountCode, useDeleteAccountCode } from "@/hooks/useAccountCodes";

export const ChartOfAccounts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<AccountCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "expense" as AccountCode["type"],
  });

  const { data: accountCodes = [], isLoading } = useAccountCodes();
  const addAccountCode = useAddAccountCode();
  const updateAccountCode = useUpdateAccountCode();
  const deleteAccountCode = useDeleteAccountCode();

  const resetForm = () => {
    setFormData({ code: "", name: "", type: "expense" });
    setEditingCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate codes
    const isDuplicate = accountCodes.some(
      code => code.code === formData.code && code.id !== editingCode?.id
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "Account code already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCode) {
        await updateAccountCode.mutateAsync({ id: editingCode.id, ...formData });
        toast({
          title: "Success",
          description: "Account code updated successfully",
        });
      } else {
        await addAccountCode.mutateAsync(formData);
        toast({
          title: "Success",
          description: "Account code added successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save account code",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (code: AccountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      name: code.name,
      type: code.type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (codeId: string) => {
    try {
      await deleteAccountCode.mutateAsync(codeId);
      toast({
        title: "Success",
        description: "Account code deleted successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete account code";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: AccountCode["type"]) => {
    switch (type) {
      case "asset": return "bg-green-100 text-green-700 border-green-300";
      case "liability": return "bg-red-100 text-red-700 border-red-300";
      case "equity": return "bg-blue-100 text-blue-700 border-blue-300";
      case "revenue": return "bg-purple-100 text-purple-700 border-purple-300";
      case "expense": return "bg-orange-100 text-orange-700 border-orange-300";
      case "transfer": return "bg-teal-100 text-teal-700 border-teal-300";
      case "payment": return "bg-indigo-100 text-indigo-700 border-indigo-300";
      case "shareholder loan": return "bg-pink-100 text-pink-700 border-pink-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Account Codes</h3>
          <p className="text-sm text-slate-600">Manage your chart of accounts</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCode ? "Edit Account Code" : "Add New Account Code"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Code *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., 6000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Office Supplies"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Type
                </label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as AccountCode["type"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="shareholder loan">Shareholder Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={addAccountCode.isPending || updateAccountCode.isPending}
                >
                  {(addAccountCode.isPending || updateAccountCode.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {editingCode ? "Update" : "Add"} Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accountCodes.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No account codes yet</h3>
          <p className="text-slate-500">Add your first account code to get started</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Type</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountCodes.map((code) => (
                <TableRow key={code.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm font-medium">
                    {code.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {code.name}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getTypeColor(code.type)}`}>
                      {code.type.charAt(0).toUpperCase() + code.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(code)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(code.id)}
                        disabled={deleteAccountCode.isPending}
                        className="h-8 w-8 p-0"
                      >
                        {deleteAccountCode.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

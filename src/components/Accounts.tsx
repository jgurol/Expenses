
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building2, Loader2 } from "lucide-react";
import { useAccounts, useAddAccount, useUpdateAccount, useDeleteAccount, type Account } from "@/hooks/useAccounts";

export const Accounts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    account_number: "",
    name: "",
    description: "",
    balance: 0,
    is_active: true,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const resetForm = () => {
    setFormData({
      account_number: "",
      name: "",
      description: "",
      balance: 0,
      is_active: true,
    });
    setEditingAccount(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_number || !formData.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate account numbers
    const isDuplicate = accounts.some(
      account => account.account_number === formData.account_number && account.id !== editingAccount?.id
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "Account number already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingAccount) {
        await updateAccount.mutateAsync({ id: editingAccount.id, ...formData });
        toast({
          title: "Success",
          description: "Account updated successfully",
        });
      } else {
        await addAccount.mutateAsync(formData);
        toast({
          title: "Success",
          description: "Account added successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save account",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      account_number: account.account_number,
      name: account.name,
      description: account.description || "",
      balance: account.balance,
      is_active: account.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (accountId: string) => {
    try {
      await deleteAccount.mutateAsync(accountId);
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (accountsLoading) {
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
          <h3 className="text-lg font-semibold text-slate-900">Accounts</h3>
          <p className="text-sm text-slate-600">Manage your active accounts</p>
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
                {editingAccount ? "Edit Account" : "Add New Account"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Number *
                </label>
                <Input
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="e.g., 1000-001"
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
                  placeholder="e.g., Primary Checking Account"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Starting Balance
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={addAccount.isPending || updateAccount.isPending}
                >
                  {(addAccount.isPending || updateAccount.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {editingAccount ? "Update" : "Add"} Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No accounts yet</h3>
          <p className="text-slate-500">Add your first account to get started</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm font-medium">
                    {account.account_number}
                  </TableCell>
                  <TableCell className="font-medium">
                    {account.name}
                    {account.description && (
                      <div className="text-sm text-slate-500">{account.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(account.balance)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                        disabled={deleteAccount.isPending}
                        className="h-8 w-8 p-0"
                      >
                        {deleteAccount.isPending ? (
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

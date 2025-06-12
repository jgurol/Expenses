
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, LogOut, Users, FileText, Cog, Archive, TrendingUp, Key, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { UserRole } from "@/pages/Index";

interface AppHeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const AppHeader = ({ currentRole, onRoleChange }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { signOut, user, isAdmin, isBookkeeper } = useAuth();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Password updated successfully',
        });
        setPasswordDialogOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/5ce6f47b-68c9-4fa6-8ab0-fb55f3806ba4.png" 
                alt="California Telecom" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Expense Manager</h1>
                <p className="text-slate-600">Streamline your business expense classification</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {onRoleChange && (
                <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
              )}

              <Button
                variant="outline"
                onClick={() => navigate("/analytics")}
                className="flex items-center gap-2 bg-purple-100 border-purple-200 text-purple-700 hover:bg-purple-200 hover:border-purple-300"
              >
                <TrendingUp className="h-4 w-4" />
                Analytics
              </Button>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{user?.email}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200 hover:border-blue-300"
                  >
                    <Cog className="h-4 w-4" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/sources")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Sources
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/categories")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Categories
                  </DropdownMenuItem>
                  {(isBookkeeper || isAdmin) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/users")}>
                        <Users className="h-4 w-4 mr-2" />
                        User Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/archived")}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archived Expenses
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handlePasswordReset} 
                disabled={isUpdatingPassword || !newPassword || !confirmPassword} 
                className="flex-1"
              >
                {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setPasswordDialogOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

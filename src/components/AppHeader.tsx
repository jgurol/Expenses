
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, FileText, CheckCircle, UserCheck, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/pages/Index";

interface AppHeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const AppHeader = ({ currentRole, onRoleChange }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { signOut, user, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expense Manager</h1>
            <p className="text-slate-600">Streamline your business expense classification</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/sources")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Sources
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/categories")}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Categories
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/reconcile")}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Reconcile
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/reconciled")}
              className="flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Reconciled
            </Button>

            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate("/users")}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Users
              </Button>
            )}

            {onRoleChange && (
              <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
            )}

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>{user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

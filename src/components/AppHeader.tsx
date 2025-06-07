
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Settings, CheckCircle, UserCheck, LogOut, Users, FileText, Cog, FileCode, Archive } from "lucide-react";
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
  const { signOut, user, isAdmin, isClassifier, isBookkeeper } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Only show classifier button if user has classifier role or is admin
  // Don't show it for bookkeeper-only users
  const showClassifierButton = isClassifier || isAdmin;

  return (
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
            {showClassifierButton && (
              <Button
                variant="outline"
                onClick={() => navigate("/classifier")}
                className="flex items-center gap-2 bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200 hover:border-blue-300"
              >
                <FileCode className="h-4 w-4" />
                Classifier
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => navigate("/reconcile")}
              className="flex items-center gap-2 bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200 hover:border-blue-300"
            >
              <CheckCircle className="h-4 w-4" />
              Reconcile
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/reconciled")}
              className="flex items-center gap-2 bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200 hover:border-blue-300"
            >
              <UserCheck className="h-4 w-4" />
              Reconciled
            </Button>

            {onRoleChange && (
              <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
            )}

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
  );
};

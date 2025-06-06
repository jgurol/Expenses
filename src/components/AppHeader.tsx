
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSwitcher } from "./RoleSwitcher";
import type { UserRole } from "@/pages/Index";

interface AppHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const AppHeader = ({ currentRole, onRoleChange }: AppHeaderProps) => {
  const navigate = useNavigate();

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
              onClick={() => navigate("/chart-of-accounts")}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Chart of Accounts
            </Button>

            <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
          </div>
        </div>
      </div>
    </header>
  );
};

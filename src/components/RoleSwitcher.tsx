
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import type { UserRole } from "@/pages/Index";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher = ({ currentRole, onRoleChange }: RoleSwitcherProps) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-600">Current Role:</span>
      <div className="flex bg-slate-100 rounded-lg p-1">
        <Button
          variant={currentRole === "bookkeeper" ? "default" : "ghost"}
          size="sm"
          onClick={() => onRoleChange("bookkeeper")}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Bookkeeper
        </Button>
        <Button
          variant={currentRole === "classifier" ? "default" : "ghost"}
          size="sm"
          onClick={() => onRoleChange("classifier")}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Classifier
        </Button>
      </div>
    </div>
  );
};

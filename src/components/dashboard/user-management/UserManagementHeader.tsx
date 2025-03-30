
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface UserManagementHeaderProps {
  onAddAdmin: () => void;
}

export const UserManagementHeader = ({ onAddAdmin }: UserManagementHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-primary/30 relative after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:shadow-[0_0_5px_1px_rgba(234,56,76,0.7)] after:animate-pulse-slow">
      <CardTitle className="text-2xl font-bold">User Management</CardTitle>
      <Button 
        onClick={onAddAdmin}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Admin
      </Button>
    </CardHeader>
  );
};


import { useState } from "react";
import { AdminUsersTable } from "./AdminUsersTable";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";

interface AdminUsersSectionProps {
  adminUsers: ProfilesTable["Row"][];
  currentUserId: string;
  toggleAdminStatus: (userId: string, currentStatus: boolean) => Promise<void>;
  refreshUsers: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export const AdminUsersSection = ({ 
  adminUsers, 
  currentUserId, 
  toggleAdminStatus, 
  refreshUsers,
  isExpanded,
  setIsExpanded
}: AdminUsersSectionProps) => {
  return (
    <div className="mb-8">
      <div 
        className="flex items-center gap-2 mb-4 cursor-pointer hover:text-primary"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">Admin Users ({adminUsers.length})</h3>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      
      {isExpanded && (
        <AdminUsersTable 
          adminUsers={adminUsers} 
          currentUserId={currentUserId}
          toggleAdminStatus={toggleAdminStatus}
          refreshUsers={refreshUsers}
        />
      )}
    </div>
  );
};

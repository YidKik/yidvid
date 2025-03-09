
import { RegularUsersTable } from "./RegularUsersTable";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";

interface RegularUsersSectionProps {
  regularUsers: ProfilesTable["Row"][];
  toggleAdminStatus: (userId: string, currentStatus: boolean) => Promise<void>;
  refreshUsers: () => void;
}

export const RegularUsersSection = ({ 
  regularUsers, 
  toggleAdminStatus, 
  refreshUsers 
}: RegularUsersSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Regular Users ({regularUsers.length})</h3>
      <RegularUsersTable 
        regularUsers={regularUsers} 
        toggleAdminStatus={toggleAdminStatus}
        refreshUsers={refreshUsers}
      />
    </div>
  );
};

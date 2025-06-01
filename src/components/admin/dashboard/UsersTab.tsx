
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";

interface UsersTabProps {
  currentUserId: string;
}

export const UsersTab = ({ currentUserId }: UsersTabProps) => {
  return (
    <div className="space-y-8">
      <UserManagementSection currentUserId={currentUserId} />
    </div>
  );
};

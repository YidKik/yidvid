
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { BackButton } from "@/components/navigation/BackButton";

export default function UsersPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">User Management</h1>
      <UserManagementSection currentUserId={""} />
    </div>
  );
}

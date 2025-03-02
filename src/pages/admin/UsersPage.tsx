
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { BackButton } from "@/components/navigation/BackButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function UsersPage() {
  // Get current user ID
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const currentUserId = session?.user?.id || "";

  return (
    <div className="container mx-auto py-8 space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">User Management</h1>
      <UserManagementSection currentUserId={currentUserId} />
    </div>
  );
}

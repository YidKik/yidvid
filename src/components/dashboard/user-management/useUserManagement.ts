
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";

export const useUserManagement = (currentUserId: string) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { data: users, refetch: refetchUsers, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      console.log("Fetching all users...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users: " + error.message, { id: "fetch-users-error" });
        return [];
      }

      console.log("Fetched users:", data);
      return data;
    },
  });

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Check if current user is an admin first
      const { data: currentUser, error: currentUserError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", currentUserId)
        .single();

      if (currentUserError) throw currentUserError;

      if (!currentUser?.is_admin) {
        toast.error("Permission denied: Only admins can modify admin status.", { id: "admin-permission-denied" });
        return;
      }

      console.log(`Toggling admin status for user ${userId} from ${currentStatus} to ${!currentStatus}`);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success(`Admin status ${currentStatus ? "removed" : "granted"}: User has been ${currentStatus ? "removed from" : "made"} admin.`, 
        { id: `admin-status-changed-${userId}` });
      
      // Refresh the user list to reflect the changes
      refetchUsers();
    } catch (error: any) {
      console.error("Error updating admin status:", error);
      toast.error("Error updating admin status: " + error.message, { id: "admin-status-update-error" });
    }
  };

  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    );
  }) || [];

  const adminUsers = filteredUsers.filter(user => user.is_admin);
  const regularUsers = filteredUsers.filter(user => !user.is_admin);

  return {
    users,
    adminUsers,
    regularUsers,
    searchQuery,
    setSearchQuery,
    isLoading,
    refetchUsers,
    toggleAdminStatus,
    isExpanded,
    setIsExpanded
  };
};

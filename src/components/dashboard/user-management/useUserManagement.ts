
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";

export const useUserManagement = (currentUserId: string) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  
  // Check if current user is admin first
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUserId) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", currentUserId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking admin status:", error);
          return;
        }
        
        setIsCurrentUserAdmin(data?.is_admin === true);
      } catch (err) {
        console.error("Failed to check admin status:", err);
      }
    };
    
    checkAdminStatus();
  }, [currentUserId]);
  
  const { data: users, refetch: refetchUsers, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      if (!isCurrentUserAdmin) {
        toast.error("Only admins can view user data", { id: "admin-permission-denied" });
        return [];
      }
      
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
    enabled: isCurrentUserAdmin // Only run query if user is admin
  });

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!isCurrentUserAdmin) {
      toast.error("Permission denied: Only admins can modify admin status.", { id: "admin-permission-denied" });
      return;
    }
    
    try {
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
    setIsExpanded,
    isCurrentUserAdmin
  };
};

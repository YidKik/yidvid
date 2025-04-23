
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";

export const useUserManagement = (currentUserId: string) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [hasPinBypass, setHasPinBypass] = useState(false);
  
  // Check for PIN bypass on mount
  useEffect(() => {
    const pinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
    setHasPinBypass(pinBypass);
    
    if (pinBypass) {
      setIsCurrentUserAdmin(true);
    }
  }, []);
  
  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUserId && !hasPinBypass) return;
      
      if (hasPinBypass) {
        setIsCurrentUserAdmin(true);
        return;
      }
      
      try {
        // Try to use edge function first
        try {
          const { data: adminCheckData, error: funcError } = await supabase.functions.invoke('check-admin-status', {
            body: { userId: currentUserId }
          });
          
          if (!funcError && adminCheckData?.isAdmin) {
            console.log("Admin status confirmed via edge function");
            setIsCurrentUserAdmin(true);
            return;
          }
        } catch (edgeFuncError) {
          console.log("Edge function not available, falling back to direct query");
        }
        
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
  }, [currentUserId, hasPinBypass]);
  
  const { data: users, refetch: refetchUsers, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      if (!isCurrentUserAdmin && !hasPinBypass) {
        toast.error("Only admins can view user data", { id: "admin-permission-denied" });
        return [];
      }
      
      console.log("Fetching all users...");
      
      // Try using the edge function first
      try {
        console.log("Attempting to fetch users via edge function");
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-all-users');
        
        if (!edgeError && edgeData) {
          console.log("Successfully fetched users via edge function");
          return edgeData;
        }
      } catch (edgeFuncError) {
        console.log("Edge function not available, falling back to direct query", edgeFuncError);
      }
      
      // Fall back to direct query if edge function fails
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
    enabled: isCurrentUserAdmin || hasPinBypass // Only run query if user is admin or has PIN bypass
  });

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!isCurrentUserAdmin && !hasPinBypass) {
      toast.error("Permission denied: Only admins can modify admin status.", { id: "admin-permission-denied" });
      return;
    }
    
    try {
      console.log(`Toggling admin status for user ${userId} from ${currentStatus} to ${!currentStatus}`);
      
      // Try edge function first
      try {
        const { data: result, error: funcError } = await supabase.functions.invoke('toggle-admin-status', {
          body: { userId, newStatus: !currentStatus }
        });
        
        if (!funcError && result?.success) {
          toast.success(`Admin status ${currentStatus ? "removed" : "granted"}: User has been ${currentStatus ? "removed from" : "made"} admin.`, 
            { id: `admin-status-changed-${userId}` });
          refetchUsers();
          return;
        }
      } catch (edgeFuncError) {
        console.log("Edge function not available, falling back to direct query");
      }
      
      // Fall back to direct query
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
    isCurrentUserAdmin: isCurrentUserAdmin || hasPinBypass
  };
};

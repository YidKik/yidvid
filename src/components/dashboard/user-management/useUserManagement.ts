
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { secureStorage } from "@/utils/security/storageEncryption";

export const useUserManagement = (currentUserId: string) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [hasSecureAdminSession, setHasSecureAdminSession] = useState(false);

  const getAdminToken = () => {
    const adminSession = secureStorage.getSecureItem("admin-session");
    return typeof adminSession?.adminToken === "string" ? adminSession.adminToken : undefined;
  };
  
  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUserId) return;
      
      try {
        const adminToken = getAdminToken();

        if (adminToken) {
          const { data: secureAdminData, error: secureAdminError } = await supabase.functions.invoke("secure-admin-auth", {
            body: {
              action: "verify-admin",
              adminToken,
            },
          });

          if (!secureAdminError && secureAdminData?.isAdmin) {
            setHasSecureAdminSession(true);
            setIsCurrentUserAdmin(true);
            return;
          }
        }

        setHasSecureAdminSession(false);

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
        setHasSecureAdminSession(false);
      }
    };
    
    checkAdminStatus();
  }, [currentUserId]);
  
  const { data: users, refetch: refetchUsers, isLoading } = useQuery({
    queryKey: ["all-users", currentUserId, hasSecureAdminSession],
    queryFn: async () => {
      const adminToken = getAdminToken();

      const { data, error } = await supabase.functions.invoke("get-all-users", {
        body: {
          page: 1,
          perPage: 1000,
          adminToken,
        },
      });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users: " + error.message, { id: "fetch-users-error" });
        throw error;
      }

      const userList = Array.isArray(data) ? data : data?.users;

      if (!Array.isArray(userList)) {
        toast.error("Error fetching users: Invalid response format", { id: "fetch-users-error" });
        throw new Error("Invalid response format");
      }

      console.log("Fetched users via secure admin function:", userList.length);
      return userList as ProfilesTable["Row"][];
    },
    enabled: Boolean(currentUserId),
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!isCurrentUserAdmin && !hasSecureAdminSession) {
      toast.error("Permission denied: Only admins can modify admin status.", { id: "admin-permission-denied" });
      return;
    }
    
    try {
      console.log(`Toggling admin status for user ${userId} from ${currentStatus} to ${!currentStatus}`);
      const adminToken = getAdminToken();
      const { data: result, error } = await supabase.functions.invoke("toggle-admin-status", {
        body: {
          userId,
          newStatus: !currentStatus,
          adminToken,
        },
      });

      if (error) {
        throw error;
      }

      if (!result?.success) {
        throw new Error(result?.error || "Failed to update admin status");
      }

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
    isCurrentUserAdmin: isCurrentUserAdmin || hasSecureAdminSession
  };
};

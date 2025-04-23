
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FetchingIssueAlert } from "@/components/notifications/FetchingIssueAlert";
import { AddAdminDialog } from "./user-management/AddAdminDialog";
import { useUserManagement } from "./user-management/useUserManagement";
import { SearchBox } from "./user-management/SearchBox";
import { UserTableLoader } from "./user-management/UserTableLoader";
import { AdminUsersSection } from "./user-management/AdminUsersSection";
import { RegularUsersSection } from "./user-management/RegularUsersSection";
import { UserManagementHeader } from "./user-management/UserManagementHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const UserManagementSection = ({ currentUserId }: { currentUserId: string }) => {
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
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
  
  // Direct check for admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUserId && !hasPinBypass) return;
      
      if (hasPinBypass) {
        setIsCurrentUserAdmin(true);
        return;
      }
      
      try {
        // Try to use edge function to bypass RLS issues
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
        
        // Use a direct query as fallback
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", currentUserId)
          .maybeSingle();
          
        if (error) {
          console.error("UserManagementSection: Error checking admin status:", error);
          return;
        }
        
        setIsCurrentUserAdmin(data?.is_admin === true);
      } catch (err) {
        console.error("UserManagementSection: Failed to check admin status:", err);
      }
    };
    
    checkAdminStatus();
  }, [currentUserId, hasPinBypass]);
  
  const {
    adminUsers,
    regularUsers,
    searchQuery,
    setSearchQuery,
    isLoading,
    refetchUsers,
    toggleAdminStatus,
    isExpanded,
    setIsExpanded
  } = useUserManagement(currentUserId);

  const handleAddAdmin = async () => {
    try {
      if (!isCurrentUserAdmin && !hasPinBypass) {
        toast.error("Permission denied: Only admins can add new admins.");
        return;
      }

      console.log(`Looking for user with email: ${newAdminEmail}`);
      
      // Try edge function first to bypass RLS
      try {
        const { data: result, error: funcError } = await supabase.functions.invoke('add-admin-user', {
          body: { email: newAdminEmail }
        });
        
        if (!funcError && result?.success) {
          toast.success(`Admin added successfully: ${newAdminEmail} has been granted admin privileges.`);
          setNewAdminEmail("");
          setShowAddAdminDialog(false);
          refetchUsers();
          return;
        }
        
        if (result?.error) {
          toast.error(result.error);
          return;
        }
      } catch (edgeFuncError) {
        console.log("Edge function not available, falling back to direct query");
      }

      // Fallback to direct query
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", newAdminEmail)
        .maybeSingle();

      if (userError) {
        console.error("Error finding user:", userError);
        toast.error("Error finding user: " + userError.message);
        return;
      }

      if (!userData) {
        console.error("User not found: Please check the email address and try again.");
        toast.error("User not found: Please check the email address and try again.");
        return;
      }

      console.log(`Making user an admin: ${userData.email}`);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", userData.id);

      if (updateError) {
        console.error("Error updating admin status:", updateError);
        toast.error("Error updating admin status: " + updateError.message);
        return;
      }

      toast.success(`Admin added successfully: ${newAdminEmail} has been granted admin privileges.`);

      setNewAdminEmail("");
      setShowAddAdminDialog(false);
      refetchUsers();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast.error("Unexpected error: " + error.message);
    }
  };

  if (!isCurrentUserAdmin && !hasPinBypass) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to access user management.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <FetchingIssueAlert />
      
      <Card>
        <UserManagementHeader onAddAdmin={() => setShowAddAdminDialog(true)} />
        <CardContent>
          <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          {isLoading ? (
            <UserTableLoader />
          ) : (
            <>
              <AdminUsersSection 
                adminUsers={adminUsers} 
                currentUserId={currentUserId}
                toggleAdminStatus={toggleAdminStatus}
                refreshUsers={refetchUsers}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
              />

              <RegularUsersSection 
                regularUsers={regularUsers} 
                toggleAdminStatus={toggleAdminStatus}
                refreshUsers={refetchUsers}
              />
            </>
          )}
        </CardContent>
      </Card>

      <AddAdminDialog 
        showAddAdminDialog={showAddAdminDialog} 
        setShowAddAdminDialog={setShowAddAdminDialog}
        newAdminEmail={newAdminEmail}
        setNewAdminEmail={setNewAdminEmail}
        handleAddAdmin={handleAddAdmin}
      />
    </div>
  );
};

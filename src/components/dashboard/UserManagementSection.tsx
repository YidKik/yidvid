
import { useState } from "react";
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
      // Check if current user is an admin
      const { data: currentUser, error: currentUserError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", currentUserId)
        .single();

      if (currentUserError) throw currentUserError;

      if (!currentUser?.is_admin) {
        toast.error("Permission denied: Only admins can add new admins.");
        return;
      }

      console.log(`Looking for user with email: ${newAdminEmail}`);
      
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", newAdminEmail)
        .maybeSingle();

      if (userError) throw userError;

      if (!userData) {
        toast.error("User not found: Please check the email address and try again.");
        return;
      }

      console.log(`Making user an admin: ${userData.email}`);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", userData.id);

      if (updateError) throw updateError;

      toast.success(`Admin added successfully: ${newAdminEmail} has been granted admin privileges.`);

      setNewAdminEmail("");
      setShowAddAdminDialog(false);
      refetchUsers();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast.error("Error adding admin: " + error.message);
    }
  };

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

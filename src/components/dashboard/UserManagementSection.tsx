
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { FetchingIssueAlert } from "@/components/notifications/FetchingIssueAlert";
import { AdminUsersTable } from "./user-management/AdminUsersTable";
import { RegularUsersTable } from "./user-management/RegularUsersTable";
import { AddAdminDialog } from "./user-management/AddAdminDialog";
import { formatDate, getUserDisplayName, getUserDevice } from "./user-management/UserManagementUtils";

export const UserManagementSection = ({ currentUserId }: { currentUserId: string }) => {
  const { toast } = useToast();
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
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
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
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
        toast({
          title: "Permission denied",
          description: "Only admins can modify admin status.",
          variant: "destructive",
        });
        return;
      }

      console.log(`Toggling admin status for user ${userId} from ${currentStatus} to ${!currentStatus}`);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({
        title: `Admin status ${currentStatus ? "removed" : "granted"}`,
        description: `User has been ${currentStatus ? "removed from" : "made"} admin.`,
      });
      
      // Refresh the user list to reflect the changes
      refetchUsers();
    } catch (error: any) {
      console.error("Error updating admin status:", error);
      toast({
        title: "Error updating admin status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        toast({
          title: "Permission denied",
          description: "Only admins can add new admins.",
          variant: "destructive",
        });
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
        toast({
          title: "User not found",
          description: "Please check the email address and try again.",
          variant: "destructive",
        });
        return;
      }

      console.log(`Making user an admin: ${userData.email}`);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", userData.id);

      if (updateError) throw updateError;

      toast({
        title: "Admin added successfully",
        description: `${newAdminEmail} has been granted admin privileges.`,
      });

      setNewAdminEmail("");
      setShowAddAdminDialog(false);
      refetchUsers();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast({
        title: "Error adding admin",
        description: error.message,
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6">
      <FetchingIssueAlert />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">User Management</CardTitle>
          <Button 
            onClick={() => setShowAddAdminDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div 
                  className="flex items-center gap-2 mb-4 cursor-pointer hover:text-primary"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <h3 className="text-lg font-semibold">Admin Users ({adminUsers.length})</h3>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                
                {isExpanded && (
                  <AdminUsersTable 
                    adminUsers={adminUsers} 
                    currentUserId={currentUserId}
                    toggleAdminStatus={toggleAdminStatus}
                    refreshUsers={refetchUsers}
                  />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Regular Users ({regularUsers.length})</h3>
                <RegularUsersTable 
                  regularUsers={regularUsers} 
                  toggleAdminStatus={toggleAdminStatus}
                  refreshUsers={refetchUsers}
                />
              </div>
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

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const UserManagementSection = ({ currentUserId }: { currentUserId: string }) => {
  const { toast } = useToast();
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // First check if the current user is an admin
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

      // Update the user's admin status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({
        title: `Admin status ${currentStatus ? "removed" : "granted"}`,
        description: `User has been ${currentStatus ? "removed from" : "made"} admin.`,
      });
      
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating admin status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAdmin = async () => {
    try {
      // First check if the current user is an admin
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

      // Check if the user exists
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

      // Make the user an admin
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
      toast({
        title: "Error adding admin",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Management</h2>
        <Button 
          onClick={() => setShowAddAdminDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Admin Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.is_admin ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                ) : (
                  <span className="text-muted-foreground">User</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant={user.is_admin ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleAdminStatus(user.id, !!user.is_admin)}
                  disabled={user.id === currentUserId}
                >
                  {user.is_admin ? "Remove Admin" : "Make Admin"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Enter the email address of the user you want to make an admin. The user must already have an account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin}>Add Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
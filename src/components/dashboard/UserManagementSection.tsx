
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  User,
  UserCheck,
  UserX,
  Computer,
  Smartphone,
  Clock
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { FetchingIssueAlert } from "@/components/notifications/FetchingIssueAlert";

export const UserManagementSection = ({ currentUserId }: { currentUserId: string }) => {
  const { toast } = useToast();
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: users, refetch: refetchUsers, isLoading } = useQuery({
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filter users based on search query
  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    );
  }) || [];

  const adminUsers = filteredUsers.filter(user => user.is_admin);
  const regularUsers = filteredUsers.filter(user => !user.is_admin);

  // Mock function to determine user device (in a real app, you'd get this from analytics or user agent)
  const getUserDevice = (user: ProfilesTable["Row"]) => {
    // This is a mock implementation - in real application you would get this from user analytics
    // For this example, we'll consider even user IDs as desktop users and odd as mobile
    const lastChar = user.id.charAt(user.id.length - 1);
    const numValue = parseInt(lastChar, 16);
    return numValue % 2 === 0 ? "desktop" : "mobile";
  };

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
              {/* Admin Users Section */}
              <div className="mb-8">
                <div 
                  className="flex items-center gap-2 mb-4 cursor-pointer hover:text-primary"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <h3 className="text-lg font-semibold">Admin Users ({adminUsers.length})</h3>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                
                {isExpanded && (
                  <div className="bg-white rounded-md border shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No admin users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          adminUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.display_name || user.name || 'Unnamed User'}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-primary hover:bg-primary/90 flex items-center gap-1 w-fit">
                                  <Shield className="h-3 w-3" />
                                  Admin
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getUserDevice(user) === "desktop" ? (
                                  <div className="flex items-center gap-1">
                                    <Computer className="h-4 w-4 text-muted-foreground" />
                                    <span>Desktop</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                    <span>Mobile</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(user.created_at)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleAdminStatus(user.id, !!user.is_admin)}
                                  disabled={user.id === currentUserId}
                                  className="flex items-center gap-1"
                                >
                                  <UserX className="h-3 w-3" />
                                  Remove Admin
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Regular Users Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Regular Users ({regularUsers.length})</h3>
                <div className="bg-white rounded-md border shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regularUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No regular users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        regularUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{user.display_name || user.name || 'Unnamed User'}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <User className="h-3 w-3" />
                                User
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getUserDevice(user) === "desktop" ? (
                                <div className="flex items-center gap-1">
                                  <Computer className="h-4 w-4 text-muted-foreground" />
                                  <span>Desktop</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                                  <span>Mobile</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(user.created_at)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => toggleAdminStatus(user.id, !!user.is_admin)}
                                className="flex items-center gap-1"
                              >
                                <UserCheck className="h-3 w-3" />
                                Make Admin
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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

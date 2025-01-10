import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
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

export const UserManagementSection = ({ currentUserId }: { currentUserId: string }) => {
  const { toast } = useToast();
  
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
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

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

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Management</h2>
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
    </div>
  );
};

import { useState } from "react";
import { User, Shield, Computer, Smartphone, Clock, UserX, Edit2, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { formatDate, getUserDisplayName, getUserDevice, updateUsername } from "./UserManagementUtils";
import { useToast } from "@/components/ui/use-toast";

interface AdminUsersTableProps {
  adminUsers: ProfilesTable["Row"][];
  currentUserId: string;
  toggleAdminStatus: (userId: string, currentStatus: boolean) => Promise<void>;
}

export const AdminUsersTable = ({
  adminUsers,
  currentUserId,
  toggleAdminStatus
}: AdminUsersTableProps) => {
  const { toast } = useToast();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  
  const handleEditStart = (user: ProfilesTable["Row"]) => {
    setEditingUserId(user.id);
    setUsernameInput(user.username || "");
  };
  
  const handleEditCancel = () => {
    setEditingUserId(null);
    setUsernameInput("");
  };
  
  const handleEditSave = async (userId: string) => {
    if (!usernameInput.trim()) {
      toast({
        title: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const result = await updateUsername(userId, usernameInput);
    
    if (result.success) {
      toast({
        title: "Username updated successfully",
        description: `The user's username has been updated to "${usernameInput}"`,
      });
      setEditingUserId(null);
    } else {
      toast({
        title: "Failed to update username",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
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
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="h-8 w-[150px]"
                          autoFocus
                        />
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSave(user.id)}
                            className="h-7 w-7"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleEditCancel}
                            className="h-7 w-7"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{getUserDisplayName(user)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditStart(user)}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
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
  );
};

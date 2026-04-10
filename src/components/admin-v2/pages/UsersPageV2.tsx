import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Search, Shield, ShieldOff, Loader2, UserPlus, Users, ShieldCheck, Calendar, Mail
} from "lucide-react";
import { useUserManagement } from "@/components/dashboard/user-management/useUserManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@/components/dashboard/user-management/UserManagementUtils";
import { secureStorage } from "@/utils/security/storageEncryption";

interface UsersPageV2Props {
  currentUserId: string;
}

export const UsersPageV2 = ({ currentUserId }: UsersPageV2Props) => {
  const {
    adminUsers,
    regularUsers,
    searchQuery,
    setSearchQuery,
    isLoading,
    toggleAdminStatus,
    refetchUsers,
  } = useUserManagement(currentUserId);

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAddingAdmin(true);
    try {
      const adminSession = secureStorage.getSecureItem("admin-session");
      const adminToken = typeof adminSession?.adminToken === "string" ? adminSession.adminToken : undefined;

      const { data, error } = await supabase.functions.invoke("add-admin-user", {
        body: {
          email: newAdminEmail.trim(),
          adminToken,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to add admin");
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || "Failed to add admin");
        return;
      }

      toast.success("Admin status granted");
      setShowAddAdmin(false);
      setNewAdminEmail("");
      refetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  };

  const totalUsers = (adminUsers?.length || 0) + (regularUsers?.length || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#12131a] border-[#1e2028]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{totalUsers}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#12131a] border-[#1e2028]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{adminUsers?.length || 0}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#12131a] border-[#1e2028]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{regularUsers?.length || 0}</p>
              <p className="text-xs text-gray-500">Regular Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Actions */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#12131a] border-[#1e2028] text-gray-200 placeholder:text-gray-500 h-9"
          />
        </div>
        <Button
          onClick={() => setShowAddAdmin(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Add Admin
        </Button>
      </div>

      {/* Admin Users Section */}
      <Card className="bg-[#12131a] border-[#1e2028]">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm text-gray-300">Admin Users</CardTitle>
            </div>
            <span className="text-xs text-gray-500">{adminUsers?.length || 0}</span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {adminUsers && adminUsers.length > 0 ? (
            <div className="space-y-1">
              {adminUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onToggle={toggleAdminStatus}
                  isCurrentUser={user.id === currentUserId}
                  isAdmin
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-3 text-center">No admin users found</p>
          )}
        </CardContent>
      </Card>

      {/* Regular Users Section */}
      <Card className="bg-[#12131a] border-[#1e2028]">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-sm text-gray-300">Regular Users</CardTitle>
            </div>
            <span className="text-xs text-gray-500">{regularUsers?.length || 0}</span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <ScrollArea className="h-[calc(100vh-32rem)]">
            {regularUsers && regularUsers.length > 0 ? (
              <div className="space-y-1">
                {regularUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onToggle={toggleAdminStatus}
                    isCurrentUser={user.id === currentUserId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-3 text-center">No users found</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent className="bg-[#12131a] border-[#1e2028] text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Add Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm text-gray-400">User email address</label>
            <Input
              placeholder="user@example.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="bg-[#1a1b24] border-[#2a2b35] text-gray-200 placeholder:text-gray-500"
              onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowAddAdmin(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAdmin}
              disabled={!newAdminEmail.trim() || addingAdmin}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {addingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : "Grant Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const UserRow = ({
  user,
  onToggle,
  isCurrentUser,
  isAdmin,
}: {
  user: any;
  onToggle: (id: string, current: boolean) => void;
  isCurrentUser: boolean;
  isAdmin?: boolean;
}) => {
  const displayName = user.display_name || user.username || user.name || "Unnamed";
  const initial = displayName[0]?.toUpperCase() || "U";
  const joinDate = user.created_at ? formatDate(user.created_at) : "Unknown";

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1a1b24] border border-[#1e2028] hover:border-[#2a2b35] transition-colors">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-[#2a2b35] flex items-center justify-center text-sm font-semibold text-gray-300 shrink-0">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          initial
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-200 truncate">{displayName}</p>
          {isCurrentUser && (
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] px-1.5 py-0">You</Badge>
          )}
          {isAdmin && (
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0">Admin</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Mail className="h-3 w-3" /> {user.email}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" /> {joinDate}
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isCurrentUser && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggle(user.id, user.is_admin)}
          className="text-gray-400 hover:text-gray-200 h-8 w-8 p-0 shrink-0"
          title={user.is_admin ? "Remove admin" : "Make admin"}
        >
          {user.is_admin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

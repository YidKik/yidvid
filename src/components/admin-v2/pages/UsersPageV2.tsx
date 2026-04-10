import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search, Shield, ShieldOff, Loader2, UserPlus, Users, ShieldCheck, Calendar, Mail,
  Pencil, Trash2, X, Save, AlertTriangle, MoreVertical, Eye, Play, Tv, Clock, Heart, Activity
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useUserManagement } from "@/components/dashboard/user-management/useUserManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@/components/dashboard/user-management/UserManagementUtils";
import { formatDistanceToNow } from "date-fns";
import { secureStorage } from "@/utils/security/storageEncryption";
import { UserActivityDialog } from "./UserActivityDialog";
import { UserDetailPanel } from "./UserDetailPanel";

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

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  const allUsers = useMemo(() => [...(adminUsers || []), ...(regularUsers || [])], [adminUsers, regularUsers]);
  const selectedUser = useMemo(() => allUsers.find(u => u.id === selectedUserId), [allUsers, selectedUserId]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId === selectedUserId ? null : userId);
    setEditMode(false);
  };

  const handleStartEdit = () => {
    if (!selectedUser) return;
    setEditDisplayName(selectedUser.display_name || selectedUser.username || selectedUser.name || "");
    setEditUsername(selectedUser.username || "");
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setSavingEdit(true);
    try {
      const adminSession = secureStorage.getSecureItem("admin-session");
      const adminToken = typeof adminSession?.adminToken === "string" ? adminSession.adminToken : undefined;
      const { data, error } = await supabase.functions.invoke("admin-edit-user", {
        body: { userId: selectedUser.id, display_name: editDisplayName, username: editUsername, adminToken },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to update user");
      toast.success("User profile updated");
      setEditMode(false);
      refetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeletingUser(true);
    try {
      const adminSession = secureStorage.getSecureItem("admin-session");
      const adminToken = typeof adminSession?.adminToken === "string" ? adminSession.adminToken : undefined;
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { userId: selectedUser.id, adminToken },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to delete user");
      toast.success("User deleted successfully");
      setShowDeleteConfirm(false);
      setSelectedUserId(null);
      refetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeletingUser(false);
    }
  };

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
    <div className="space-y-5 max-w-[1600px]">
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
            placeholder="Search by name, email, username, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#12131a] border-[#1e2028] text-gray-200 placeholder:text-gray-500 h-9"
          />
        </div>
        <Button
          onClick={() => setShowAddAdmin(true)}
          size="sm"
          variant="outline"
          className="border-[#2a2b35] text-gray-400 hover:text-gray-200 hover:bg-[#1a1b24] h-9"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Manage Admin
        </Button>
      </div>

      {/* Main content: user list + detail panel */}
      <div className="flex gap-4">
        {/* User List */}
        <Card className={`bg-[#12131a] border-[#1e2028] flex-1 ${selectedUserId ? 'max-w-[60%]' : ''}`}>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-22rem)]">
              {/* Admin section header */}
              {adminUsers && adminUsers.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e2028]">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admins · {adminUsers.length}</span>
                  </div>
                  {adminUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isCurrentUser={user.id === currentUserId}
                      isAdmin
                      isSelected={user.id === selectedUserId}
                      onSelect={() => handleSelectUser(user.id)}
                    />
                  ))}
                </>
              )}
              {/* Regular users header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e2028] border-t border-t-[#1e2028]">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Users · {regularUsers?.length || 0}</span>
              </div>
              {regularUsers && regularUsers.length > 0 ? (
                regularUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isCurrentUser={user.id === currentUserId}
                    isSelected={user.id === selectedUserId}
                    onSelect={() => handleSelectUser(user.id)}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 py-6 text-center">No users found</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        {selectedUser && (
          <UserDetailPanel
            user={selectedUser}
            currentUserId={currentUserId}
            onClose={() => setSelectedUserId(null)}
            editMode={editMode}
            editDisplayName={editDisplayName}
            editUsername={editUsername}
            setEditDisplayName={setEditDisplayName}
            setEditUsername={setEditUsername}
            savingEdit={savingEdit}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setEditMode(false)}
            onViewActivity={() => setShowActivityDialog(true)}
            onDeleteUser={() => setShowDeleteConfirm(true)}
          />
        )}
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent className="bg-[#12131a] border-[#1e2028] text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Manage Admin Access</DialogTitle>
            <DialogDescription className="text-gray-500">Enter a user's email to grant them admin privileges.</DialogDescription>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-[#12131a] border-[#1e2028] text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Delete User
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This will permanently delete <span className="text-gray-200 font-medium">{selectedUser?.display_name || selectedUser?.email}</span> and all their data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 hover:text-gray-200" disabled={deletingUser}>
              Cancel
            </Button>
            <Button onClick={handleDeleteUser} disabled={deletingUser} className="bg-red-600 hover:bg-red-700 text-white">
              {deletingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Activity Dialog */}
      {selectedUser && (
        <UserActivityDialog
          open={showActivityDialog}
          onOpenChange={setShowActivityDialog}
          userId={selectedUser.id}
          userName={selectedUser.display_name || selectedUser.username || selectedUser.email || "User"}
        />
      )}
    </div>
  );
};

const UserRow = ({
  user,
  isCurrentUser,
  isAdmin,
  isSelected,
  onSelect,
}: {
  user: any;
  isCurrentUser: boolean;
  isAdmin?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
}) => {
  const displayName = user.display_name || user.username || user.name || "Unnamed";
  const initial = displayName[0]?.toUpperCase() || "U";
  const joinDate = user.created_at ? formatDate(user.created_at) : "Unknown";

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-[#1e2028] ${
        isSelected
          ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500'
          : 'hover:bg-[#1a1b24]'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-[#2a2b35] flex items-center justify-center text-xs font-semibold text-gray-300 shrink-0">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          initial
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-200 truncate leading-tight">{displayName}</p>
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

    </div>
  );
};

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
          <Card className="bg-[#12131a] border-[#1e2028] w-[40%] min-w-[320px]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2a2b35] flex items-center justify-center text-lg font-semibold text-gray-300 shrink-0">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      (selectedUser.display_name || selectedUser.username || "U")[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-100">
                      {selectedUser.display_name || selectedUser.username || selectedUser.name || "Unnamed"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {selectedUser.is_admin && (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0">Admin</Badge>
                      )}
                      {selectedUser.id === currentUserId && (
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] px-1.5 py-0">You</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedUserId(null)}
                  className="text-gray-500 hover:text-gray-300 h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="bg-[#1e2028] mb-4" />

              {/* User details */}
              {!editMode ? (
                <div className="space-y-3">
                  <DetailRow label="User ID" value={selectedUser.id} copyable />
                  <DetailRow label="Email" value={selectedUser.email} />
                  <DetailRow label="Display Name" value={selectedUser.display_name || "—"} />
                  <DetailRow label="Username" value={selectedUser.username || "—"} />
                  <DetailRow label="Joined" value={selectedUser.created_at ? formatDate(selectedUser.created_at) : "Unknown"} />
                  <DetailRow label="User Type" value={(selectedUser as any).user_type || "visitor"} />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Display Name</label>
                    <Input
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="bg-[#1a1b24] border-[#2a2b35] text-gray-200 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Username</label>
                    <Input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="bg-[#1a1b24] border-[#2a2b35] text-gray-200 h-8 text-sm"
                    />
                  </div>
                </div>
              )}

              <Separator className="bg-[#1e2028] my-4" />

              {/* Action buttons */}
              {selectedUser.id !== currentUserId && (
                <div className="space-y-2">
                  {!editMode ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-[#2a2b35] text-gray-300 hover:text-gray-100 hover:bg-[#1a1b24] justify-start"
                        onClick={handleStartEdit}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-[#2a2b35] text-gray-300 hover:text-gray-100 hover:bg-[#1a1b24] justify-start"
                        onClick={() => setShowActivityDialog(true)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-2" /> View Full Activity
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete User
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-gray-400 hover:text-gray-200"
                        onClick={() => setEditMode(false)}
                        disabled={savingEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                      >
                        {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5 mr-1" /> Save</>}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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

const DetailRow = ({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) => (
  <div className="flex justify-between items-center group">
    <span className="text-xs text-gray-500">{label}</span>
    <div className="flex items-center gap-1">
      <span className={`text-sm text-gray-300 text-right truncate ${copyable ? 'max-w-[160px] font-mono text-xs' : 'max-w-[200px]'}`}>{value}</span>
      {copyable && (
        <button
          onClick={() => { navigator.clipboard.writeText(value); import("sonner").then(m => m.toast.success("Copied to clipboard")); }}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity p-0.5"
          title="Copy"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      )}
    </div>
  </div>
);

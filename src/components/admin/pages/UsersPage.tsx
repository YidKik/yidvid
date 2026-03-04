import { useUserManagement } from "@/components/dashboard/user-management/useUserManagement";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, ShieldOff, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { AddAdminDialog } from "@/components/dashboard/user-management/AddAdminDialog";

interface UsersPageProps {
  currentUserId: string;
}

export const UsersPage = ({ currentUserId }: UsersPageProps) => {
  const {
    adminUsers,
    regularUsers,
    searchQuery,
    setSearchQuery,
    isLoading,
    toggleAdminStatus,
    refetchUsers,
  } = useUserManagement(currentUserId);

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,10%,55%)]" />
          <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Add Admin
        </Button>
      </div>

      {/* Admin Users */}
      <Section title="Admin Users" count={adminUsers.length}>
        {adminUsers.map((user) => (
          <UserRow key={user.id} user={user} onToggle={toggleAdminStatus} isCurrentUser={user.id === currentUserId} />
        ))}
      </Section>

      {/* Regular Users */}
      <Section title="Regular Users" count={regularUsers.length}>
        {regularUsers.map((user) => (
          <UserRow key={user.id} user={user} onToggle={toggleAdminStatus} isCurrentUser={user.id === currentUserId} />
        ))}
      </Section>

      <AddAdminDialog
        isOpen={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdminAdded={refetchUsers}
      />
    </div>
  );
};

const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-[hsl(220,13%,91%)]">
    <div className="px-5 py-3 border-b border-[hsl(220,13%,93%)]">
      <h3 className="text-sm font-semibold text-[hsl(220,15%,18%)]">
        {title} <span className="text-[hsl(220,10%,55%)] font-normal">({count})</span>
      </h3>
    </div>
    <div className="divide-y divide-[hsl(220,13%,93%)]">{children}</div>
  </div>
);

const UserRow = ({ user, onToggle, isCurrentUser }: { user: any; onToggle: (id: string, current: boolean) => void; isCurrentUser: boolean }) => (
  <div className="flex items-center justify-between px-5 py-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-8 h-8 rounded-full bg-[hsl(220,14%,92%)] flex items-center justify-center text-xs font-medium text-[hsl(220,15%,35%)]">
        {(user.display_name || user.email || "U")[0].toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[hsl(220,15%,18%)] truncate">{user.display_name || user.name || "No name"}</p>
        <p className="text-xs text-[hsl(220,10%,55%)] truncate">{user.email}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {user.is_admin && <Badge className="bg-[hsl(250,80%,60%)] text-white text-[10px]">Admin</Badge>}
      {!isCurrentUser && (
        <Button size="sm" variant="ghost" onClick={() => onToggle(user.id, user.is_admin)}>
          {user.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
        </Button>
      )}
    </div>
  </div>
);

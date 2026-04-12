import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { LogOut, Trash2, AlertTriangle, Mail, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";

export const SettingsProfile = () => {
  const { user, profile, signOut, isLoading: authLoading } = useUnifiedAuth();
  const { isMobile } = useIsMobile();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["user-profile-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, name, avatar_url, email, created_at")
        .eq("id", user.id)
        .maybeSingle();
      return data as ProfilesTable["Row"] | null;
    },
    enabled: !!user?.id,
    staleTime: 10000,
  });

  const displayProfile = profile || profileData || (user?.id ? {
    id: user.id, email: user.email, name: user.email?.split("@")[0],
    display_name: user.email?.split("@")[0] || "User",
    username: null, avatar_url: null, created_at: new Date().toISOString()
  } : null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) { toast.error("Failed to delete account."); setIsDeleting(false); return; }
      await supabase.auth.signOut();
      toast.success("Your account has been deleted.");
      window.location.href = "/";
    } catch { toast.error("Something went wrong."); setIsDeleting(false); }
  };

  if (!displayProfile) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-[#ccc] mx-auto mb-3" />
        <p className="text-[#666] dark:text-[#aaa] font-medium">Sign in to view your profile</p>
      </div>
    );
  }

  const username = displayProfile.username || displayProfile.display_name || displayProfile.name || "User";
  const email = displayProfile.email || "";
  const createdAt = (displayProfile as any).created_at;
  const memberSince = createdAt
    ? format(new Date(createdAt), "MMMM d, yyyy")
    : "Unknown";
  const initials = username.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      {/* Profile Card */}
      <div className={cn("flex items-center gap-4 mb-6", isMobile && "flex-col text-center")}>
        <Avatar className={cn(isMobile ? "h-20 w-20" : "h-16 w-16", "border-2 border-[#E5E5E5] dark:border-[#333]")}>
          <AvatarImage src={displayProfile.avatar_url || ""} alt={username} />
          <AvatarFallback className="bg-[#FF0000]/10 text-[#FF0000] font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#e8e8e8]">{username}</h2>
          <p className="text-sm text-[#666] dark:text-[#aaa]">Your account details</p>
        </div>
      </div>

      {/* Info Fields */}
      <div className="space-y-4 mb-8">
        <InfoRow icon={Mail} label="Email" value={email} />
        <InfoRow icon={User} label="Username" value={displayProfile.username || "Not set"} />
        <InfoRow icon={Calendar} label="Member since" value={memberSince} />
      </div>

      {/* Actions */}
      <div className="border-t border-[#E5E5E5] dark:border-[#333] pt-5 space-y-3">
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full h-11 rounded-xl font-semibold text-[#1A1A1A] dark:text-[#e8e8e8] border-[#E5E5E5] dark:border-[#333] hover:bg-[#F5F5F5] dark:hover:bg-[#272727]"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold text-[#FF0000] border-[#FF0000]/30 hover:bg-[#FF0000]/5 hover:border-[#FF0000]/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF0000]/10">
                <AlertTriangle className="h-7 w-7 text-[#FF0000]" />
              </div>
              <DialogTitle className="text-[#FF0000] text-xl font-bold">Delete Account</DialogTitle>
              <DialogDescription className="text-[#666] dark:text-[#aaa] text-sm pt-2">
                This action <strong>cannot be undone</strong>. All your data will be <strong>permanently deleted</strong>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-3 sm:flex-col pt-4">
              <Button onClick={handleDeleteAccount} disabled={isDeleting}
                className="w-full bg-[#FF0000] hover:bg-[#CC0000] text-white rounded-xl h-11 font-semibold">
                {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
              </Button>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}
                className="w-full rounded-xl h-11 font-semibold">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-[#F9F9F9] dark:bg-[#0f0f0f] border border-[#E5E5E5] dark:border-[#333]">
      <Icon className="h-4 w-4 text-[#999] shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#999] font-medium">{label}</p>
        <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#e8e8e8] truncate">{value}</p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { LogOut, Trash2, AlertTriangle, Mail, Calendar, User, Hash, Bell, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";

export const SettingsProfile = () => {
  const { user, profile, signOut, isLoading: authLoading, refreshProfile } = useUnifiedAuth();
  const { isMobile } = useIsMobile();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Sync Google avatar to profile on mount if missing
  useEffect(() => {
    if (!user?.id) return;
    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    if (!googleAvatar) return;
    
    // Check if profile already has an avatar
    const currentAvatar = profile?.avatar_url;
    if (!currentAvatar) {
      supabase
        .from("profiles")
        .update({ avatar_url: googleAvatar })
        .eq("id", user.id)
        .then(({ error }) => {
          if (!error) {
            queryClient.invalidateQueries({ queryKey: ["user-profile", user.id] });
            queryClient.invalidateQueries({ queryKey: ["user-profile-settings", user.id] });
          }
        });
    }
  }, [user?.id, user?.user_metadata, profile?.avatar_url, queryClient]);

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

  const { data: emailPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ["email-preferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("email_preferences")
        .select("new_video_emails, digest_frequency")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const updateEmailPrefs = useMutation({
    mutationFn: async ({ enabled, frequency }: { enabled: boolean; frequency?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const updates: any = { new_video_emails: enabled };
      if (frequency !== undefined) updates.digest_frequency = frequency;
      if (!enabled) updates.digest_frequency = null;
      const { error } = await supabase
        .from("email_preferences")
        .update(updates)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onMutate: async ({ enabled, frequency }) => {
      await queryClient.cancelQueries({ queryKey: ["email-preferences", user?.id] });
      const previous = queryClient.getQueryData(["email-preferences", user?.id]);
      queryClient.setQueryData(["email-preferences", user?.id], (old: any) => ({
        ...old,
        new_video_emails: enabled,
        digest_frequency: enabled ? (frequency || old?.digest_frequency || "daily") : null,
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["email-preferences", user?.id], context.previous);
      }
      toast.error("Failed to update preferences");
    },
    onSuccess: () => {
      toast.success("Email preferences updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["email-preferences", user?.id] });
    },
  });

  const removeAvatar = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["user-profile-settings", user?.id] });
      toast.success("Profile picture removed");
    },
    onError: () => toast.error("Failed to remove profile picture"),
  });

  const videoEmailsEnabled = emailPrefs?.new_video_emails ?? false;
  const digestFrequency = (emailPrefs as any)?.digest_frequency || "daily";

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
  const avatarUrl = displayProfile.avatar_url || "";
  const hasAvatar = !!avatarUrl;

  return (
    <div>
      {/* Profile Card */}
      <div className={cn("flex items-center gap-4 mb-6", isMobile && "flex-col text-center")}>
        <div className="relative group">
          <Avatar className={cn(isMobile ? "h-20 w-20" : "h-16 w-16", "border-2 border-[#E5E5E5] dark:border-[#333]")}>
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback className="bg-[#FF0000]/10 text-[#FF0000] font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          {hasAvatar && (
            <button
              onClick={() => removeAvatar.mutate()}
              disabled={removeAvatar.isPending}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#666]/80 hover:bg-[#FF0000] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Remove profile picture"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#e8e8e8]">{username}</h2>
          <p className="text-sm text-[#666] dark:text-[#aaa]">Your account details</p>
        </div>
      </div>

      {/* Info Fields */}
      <div className="space-y-4 mb-6">
        <InfoRow icon={Mail} label="Email" value={email} />
        <InfoRow icon={User} label="Username" value={displayProfile.username || "Not set"} />
        <InfoRow icon={Hash} label="User ID" value={user?.id || "Unknown"} />
        <InfoRow icon={Calendar} label="Member since" value={memberSince} />
      </div>

      {/* Video Digest Email Preferences */}
      <div className="mb-8 p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#0f0f0f] border border-[#E5E5E5] dark:border-[#333]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-[#FF0000]" />
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#e8e8e8]">Video digest emails</p>
              <p className="text-xs text-[#888] mt-0.5">Get notified about new videos from your subscribed channels</p>
            </div>
          </div>
          <Switch
            checked={videoEmailsEnabled}
            onCheckedChange={(checked) => {
              updateEmailPrefs.mutate({ enabled: checked, frequency: checked ? "daily" : undefined });
            }}
            disabled={prefsLoading || updateEmailPrefs.isPending}
          />
        </div>
        {videoEmailsEnabled && (
          <div className="mt-3 pt-3 border-t border-[#E5E5E5] dark:border-[#333]">
            <p className="text-xs text-[#888] mb-2.5">How often would you like to receive digests?</p>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={digestFrequency === "daily"}
                  onCheckedChange={(checked) => {
                    if (checked) updateEmailPrefs.mutate({ enabled: true, frequency: "daily" });
                  }}
                  disabled={updateEmailPrefs.isPending}
                />
                <span className="text-sm text-[#1A1A1A] dark:text-[#e8e8e8] font-medium">Daily</span>
                <span className="text-xs text-[#888]">— Receive a summary every morning</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={digestFrequency === "weekly"}
                  onCheckedChange={(checked) => {
                    if (checked) updateEmailPrefs.mutate({ enabled: true, frequency: "weekly" });
                  }}
                  disabled={updateEmailPrefs.isPending}
                />
                <span className="text-sm text-[#1A1A1A] dark:text-[#e8e8e8] font-medium">Weekly</span>
                <span className="text-xs text-[#888]">— Receive a summary once a week</span>
              </label>
            </div>
          </div>
        )}
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

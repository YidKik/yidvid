import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileInfo } from "./profile/ProfileInfo";
import { ProfileSectionSkeleton } from "./profile/ProfileSectionSkeleton";
import { ProfileErrorState } from "./profile/ProfileErrorState";
import { AccountActions } from "./profile/AccountActions";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const ProfileSection = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading: authLoading } = useUnifiedAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();
  
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  const { data: additionalProfileData, isLoading: profileLoading, error } = useQuery({
    queryKey: ["user-profile-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, name, avatar_url, email, created_at")
          .eq("id", user.id)
          .maybeSingle();
        if (error) return null;
        return data as ProfilesTable["Row"];
      } catch (err) {
        return null;
      }
    },
    enabled: !!user?.id,
    staleTime: 10000,
    retry: 1,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account. Please try again.");
        setIsDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      toast.success("Your account has been deleted.");
      window.location.href = "/";
    } catch (error) {
      console.error("Error during account deletion:", error);
      toast.error("Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  };

  const isLoading = authLoading || profileLoading;
  const displayProfile = profile || additionalProfileData || (user?.id ? {
    id: user.id,
    email: userEmail || user?.email,
    name: userEmail?.split('@')[0] || user?.email?.split('@')[0],
    display_name: userEmail?.split('@')[0] || user?.email?.split('@')[0] || 'User',
    username: null,
    avatar_url: null,
    created_at: new Date().toISOString()
  } : null);

  if (isLoading) return <ProfileSectionSkeleton />;

  if (error && !displayProfile) {
    return (
      <ProfileErrorState
        userEmail={userEmail || user?.email || null}
        isLoggingOut={false}
        handleLogout={signOut}
      />
    );
  }

  const showingFallback = !!error && !!displayProfile;

  return (
    <div style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
        <User size={18} className="text-yellow-600" />
        <h2 className="text-lg font-bold text-gray-900">Your Profile</h2>
      </div>
      
      {showingFallback && (
        <div className="text-amber-600 text-sm mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Using limited profile data. Some features may be unavailable.
        </div>
      )}
      
      <div className="flex items-start gap-4 mb-5">
        <ProfileAvatar 
          avatarUrl={displayProfile?.avatar_url || ""}
          displayName={displayProfile?.display_name || ""}
          username={displayProfile?.username || ""}
          profile={displayProfile as ProfilesTable["Row"]}
        />
        <ProfileInfo profile={displayProfile as ProfilesTable["Row"]} />
      </div>
      
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <AccountActions
          isLoggingOut={false}
          handleLogout={signOut}
        />
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors rounded-xl h-11"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-semibold">Delete Account</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-red-200 rounded-2xl max-w-md">
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <DialogTitle className="text-red-600 text-xl font-bold">Delete Account</DialogTitle>
              <DialogDescription className="text-gray-600 text-sm leading-relaxed pt-2">
                Are you sure you want to delete your account? This action <strong className="text-gray-900">cannot be undone</strong> and all your data — including your profile, watch history, and preferences — will be <strong className="text-gray-900">permanently deleted</strong>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-col pt-2">
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-semibold"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)} 
                disabled={isDeleting}
                className="w-full rounded-xl h-11 font-semibold"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

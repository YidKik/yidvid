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
import { Trash2, User } from "lucide-react";

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

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) return;
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error during account deletion:", error);
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
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors rounded-xl h-11"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-semibold">Delete Account</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-red-200 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
              >
                Yes, Delete My Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

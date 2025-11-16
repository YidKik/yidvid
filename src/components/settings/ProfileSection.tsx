
import { Card } from "@/components/ui/card";
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
import { Trash2 } from "lucide-react";

export const ProfileSection = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading: authLoading } = useUnifiedAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();
  
  // Set user email from unified auth
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  // Use a single query for additional profile data if needed
  const { data: additionalProfileData, isLoading: profileLoading, error } = useQuery({
    queryKey: ["user-profile-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, name, avatar_url, email, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching additional profile data:", error);
          return null;
        }

        return data as ProfilesTable["Row"];
      } catch (err) {
        console.error("Unexpected error fetching additional profile data:", err);
        return null;
      }
    },
    enabled: !!user?.id,
    staleTime: 10000,
    retry: 1,
  });

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) {
        console.error("Error deleting account:", error);
        return;
      }
      
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Unexpected error during account deletion:", error);
    }
  };

  const isLoading = authLoading || profileLoading;

  // Use profile data from unified auth or additional data as fallback
  const displayProfile = profile || additionalProfileData || (user?.id ? {
    id: user.id,
    email: userEmail || user?.email,
    name: userEmail?.split('@')[0] || user?.email?.split('@')[0],
    display_name: userEmail?.split('@')[0] || user?.email?.split('@')[0] || 'User',
    username: null,
    avatar_url: null,
    created_at: new Date().toISOString()
  } : null);

  if (isLoading) {
    return <ProfileSectionSkeleton />;
  }

  // Show error UI only if no fallback is available
  if (error && !displayProfile) {
    return (
      <ProfileErrorState
        userEmail={userEmail || user?.email || null}
        isLoggingOut={false}
        handleLogout={signOut}
      />
    );
  }

  // If we have fallback data but no proper profile, show limited UI with warning
  const showingFallback = !!error && !!displayProfile;

  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg rounded-3xl bg-gradient-to-br from-card to-primary/5">
      <div className="p-4 md:p-6">
        {showingFallback && (
          <div className="text-amber-500 text-xs mb-4 px-1 bg-amber-50 rounded-lg p-2">
            Using limited profile data. Some features may be unavailable.
          </div>
        )}
        <div className={`flex ${isMobile ? 'items-start gap-3' : 'items-center gap-4'} mb-4`}>
          <ProfileAvatar 
            avatarUrl={displayProfile?.avatar_url || ""}
            displayName={displayProfile?.display_name || ""}
            username={displayProfile?.username || ""}
            profile={displayProfile as ProfilesTable["Row"]}
          />
          <ProfileInfo profile={displayProfile as ProfilesTable["Row"]} />
        </div>
        <div className="space-y-3">
          <AccountActions
            isLoggingOut={false}
            handleLogout={signOut}
          />
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Delete My Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

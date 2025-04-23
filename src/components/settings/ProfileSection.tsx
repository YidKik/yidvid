import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { Card } from "@/components/ui/card";
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
  const { handleLogout, isLoggingOut, session } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();
  
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  const cachedProfile = session?.user?.id
    ? useQuery({
        queryKey: ["user-profile-minimal", session.user.id],
        queryFn: async () => null,
        staleTime: Infinity,
        enabled: false,
      }).data
    : null;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile-settings", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return cachedProfile || null;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, email")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          return cachedProfile || { 
            id: session.user.id, 
            email: session.user.email,
            display_name: session.user.email?.split('@')[0]
          };
        }

        return data as ProfilesTable["Row"];
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        return cachedProfile || { 
          id: session.user.id, 
          email: session.user.email,
          display_name: session.user.email?.split('@')[0]
        };
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 10000,
    retry: 1,
  });

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user', {});
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

  const fallbackProfile = profile || (session?.user?.id ? {
    id: session.user.id,
    email: userEmail || session?.user?.email,
    display_name: userEmail?.split('@')[0] || session?.user?.email?.split('@')[0] || 'User',
    username: null,
    avatar_url: null
  } : null);

  if (isLoading) {
    return <ProfileSectionSkeleton />;
  }

  if (error && !fallbackProfile) {
    return (
      <ProfileErrorState
        userEmail={userEmail || session?.user?.email || null}
        isLoggingOut={isLoggingOut}
        handleLogout={handleLogout}
      />
    );
  }

  const showingFallback = !!error && !!fallbackProfile;

  return (
    <section className={`mb-${isMobile ? '2' : '8'}`}>
      <Card className={`${isMobile ? 'p-2' : 'p-6'} overflow-hidden`}>
        <div className="flex flex-col gap-2">
          {showingFallback && (
            <div className="text-amber-500 text-xs mb-2 px-1">
              Using limited profile data. Some features may be unavailable.
            </div>
          )}
          <div className={`flex ${isMobile ? 'items-start gap-2' : 'items-center gap-4'}`}>
            <ProfileAvatar 
              avatarUrl={fallbackProfile?.avatar_url || ""}
              displayName={fallbackProfile?.display_name || ""}
              username={fallbackProfile?.username || ""}
              profile={fallbackProfile as ProfilesTable["Row"]}
            />
            <ProfileInfo profile={fallbackProfile as ProfilesTable["Row"]} />
          </div>
          <div className="space-y-2">
            <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row gap-4'}`}>
              <AccountActions
                isLoggingOut={isLoggingOut}
                handleLogout={handleLogout}
              />
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors"
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
        </div>
      </Card>
    </section>
  );
};

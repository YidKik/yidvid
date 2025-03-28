
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileInfo } from "./profile/ProfileInfo";
import { ProfileSectionSkeleton } from "./profile/ProfileSectionSkeleton";
import { ProfileErrorState } from "./profile/ProfileErrorState";
import { AccountActions } from "./profile/AccountActions";

export const ProfileSection = () => {
  const navigate = useNavigate();
  const { handleLogout, isLoggingOut, session } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Use session data directly from useAuth hook to avoid waiting for another session fetch
  const userId = session?.user?.id;

  // Initialize email from session if available
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile-settings", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No session available for profile query");
        return null;
      }

      try {
        // Use a simpler query that doesn't trigger RLS recursion issues
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, email, created_at, updated_at")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        return data as ProfilesTable["Row"];
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        throw err;
      }
    },
    enabled: !!userId, // Only run query when userId is available
    staleTime: 60000, // Keep data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    retry: 1, // Reduce retry attempts to speed up fallback to error state
  });

  // Show loading state immediately when profile is loading
  if (isLoading) {
    return <ProfileSectionSkeleton />;
  }

  // Show error state if there was an error loading profile
  if (error || !profile) {
    return (
      <ProfileErrorState
        userEmail={userEmail || session?.user?.email || null}
        isLoggingOut={isLoggingOut}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <section className={`mb-${isMobile ? '2' : '8'}`}>
      <Card className={`${isMobile ? 'p-2' : 'p-6'} overflow-hidden`}>
        <div className="flex flex-col gap-2">
          <div className={`flex ${isMobile ? 'items-start gap-2' : 'items-center gap-4'}`}>
            <ProfileAvatar 
              avatarUrl={profile.avatar_url || ""}
              displayName={profile.display_name || ""}
              username={profile.username || ""}
              profile={profile}
            />
            <ProfileInfo profile={profile} />
          </div>
          <AccountActions
            isLoggingOut={isLoggingOut}
            handleLogout={handleLogout}
          />
        </div>
      </Card>
    </section>
  );
};

import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useIsMobile";
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
  const { isMobile } = useIsMobile();
  
  const userId = session?.user?.id;

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
    enabled: !!userId,
    staleTime: 60000,
    gcTime: 300000,
    retry: 1,
  });

  if (isLoading) {
    return <ProfileSectionSkeleton />;
  }

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

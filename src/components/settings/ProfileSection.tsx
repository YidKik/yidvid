
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileInfo } from "./profile/ProfileInfo";
import { ProfileSectionSkeleton } from "./profile/ProfileSectionSkeleton";
import { ProfileErrorState } from "./profile/ProfileErrorState";
import { AccountActions } from "./profile/AccountActions";

export const ProfileSection = () => {
  const navigate = useNavigate();
  const { handleLogout, isLoggingOut } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data as ProfilesTable["Row"];
    },
    retry: 2,
    meta: {
      errorBoundary: false
    }
  });

  useEffect(() => {
    if (error) {
      supabase.auth.getSession().then(({ data }) => {
        const email = data.session?.user?.email;
        setUserEmail(email || null);
      });
    }
  }, [error]);

  if (isLoading) {
    return <ProfileSectionSkeleton />;
  }

  if (error || !profile) {
    return (
      <ProfileErrorState
        userEmail={userEmail}
        isLoggingOut={isLoggingOut}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <section className="mb-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
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

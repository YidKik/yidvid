
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileInfo } from "./profile/ProfileInfo";
import { WelcomeNameField } from "./profile/WelcomeNameField";

export const ProfileSection = () => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [welcomeName, setWelcomeName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single<ProfilesTable["Row"]>();

      if (error) {
        console.error("Error loading profile:", error);
        toast.error("Error loading profile");
        return null;
      }

      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || "");
      setWelcomeName(profile.welcome_name || profile.display_name || "");
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      const updates: Partial<ProfilesTable["Row"]> = {
        display_name: displayName,
        username: username.trim() || null,
        avatar_url: avatarUrl,
        welcome_name: welcomeName.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) {
        console.error("Error updating profile:", error);
        if (error.code === '23505') {
          toast.error("Username is already taken");
        } else {
          toast.error("Failed to update welcome name. Please try again.");
        }
        return;
      }

      await refetch();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("Failed to update profile");
    }
  };

  if (!profile) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="relative">
            {/* Show only User ID section clearly */}
            <ProfileInfo profile={profile} />

            {/* Blur everything else with an overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 mt-[84px]">
              <Alert variant="default" className="w-[90%] max-w-lg border-muted mx-auto mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Profile settings are currently unavailable.
                </AlertDescription>
              </Alert>
            </div>

            <div className="filter blur-[2px]">
              <ProfileAvatar
                avatarUrl={avatarUrl}
                displayName={displayName}
                username={username}
                profile={profile}
              />

              <WelcomeNameField
                welcomeName={welcomeName}
                setWelcomeName={setWelcomeName}
                handleSave={handleSave}
              />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

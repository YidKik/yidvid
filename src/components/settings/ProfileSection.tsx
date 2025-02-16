
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Camera, Copy, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";

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

  const copyUserId = () => {
    if (profile?.id) {
      navigator.clipboard.writeText(profile.id);
      toast.success("User ID copied to clipboard");
    }
  };

  const copyUsername = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(profile.username);
      toast.success("Username copied to clipboard");
    }
  };

  if (!profile) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10">
              <Alert variant="default" className="w-[90%] max-w-lg border-muted mx-auto mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Profile settings are currently unavailable.
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  {displayName || username || "Anonymous User"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-xs text-muted-foreground">
                  {profile.id}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyUserId}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {profile.username && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.username}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyUsername}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="p-3 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="welcomeName">Welcome Page Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="welcomeName"
                    value={welcomeName}
                    onChange={(e) => setWelcomeName(e.target.value)}
                    placeholder="Enter your welcome page name"
                  />
                  <Button onClick={handleSave} variant="secondary">
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This name will be displayed on the welcome page when you visit the site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

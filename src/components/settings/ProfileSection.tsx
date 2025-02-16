
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Camera, Copy, User } from "lucide-react";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";

export const ProfileSection = () => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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
        username: username.trim() || null, // Ensure empty string is saved as null
        avatar_url: avatarUrl,
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
          toast.error("Error updating profile");
        }
        return;
      }

      await refetch(); // Refresh the profile data
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

  if (!profile) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
      <Card className="p-6">
        <div className="space-y-6">
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
              {isEditing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full"
                  onClick={() => {
                    // TODO: Implement image upload
                    toast.info("Image upload coming soon");
                  }}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium">
                {displayName || username || "Anonymous User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {profile.email}
              </p>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(profile.display_name || "");
                    setUsername(profile.username || "");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
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
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};

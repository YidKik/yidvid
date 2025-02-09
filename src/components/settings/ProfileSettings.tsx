
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, User } from "lucide-react";

export const ProfileSettings = () => {
  const [uploading, setUploading] = useState(false);
  const [newName, setNewName] = useState("");
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to view your profile");
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        throw error;
      }
      
      setNewName(data?.name || "");
      return data;
    },
  });

  const handleNameUpdate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to update your profile");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ name: newName })
        .eq("id", session.user.id);

      if (error) {
        console.error("Error updating name:", error);
        toast.error("Failed to update name");
        throw error;
      }

      toast.success("Name updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to upload an avatar");
        return;
      }

      // Create a folder with the user's ID to organize uploads
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        toast.error("Failed to upload avatar");
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        toast.error("Failed to update profile with new avatar");
        throw updateError;
      }

      toast.success("Avatar updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (error) {
      console.error("Error in avatar upload process:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="Profile" />
            ) : (
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
              disabled={uploading}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Avatar"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Your profile picture will be visible to you and other users when interacting on the platform.
            </p>
          </div>
        </div>

        <div className="space-y-2 bg-[#F1F0FB] p-4 rounded-lg">
          <Label htmlFor="name" className="text-lg font-semibold">Display Name</Label>
          <div className="flex gap-2">
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter your display name"
              className="bg-white"
            />
            <Button onClick={handleNameUpdate}>Save</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This name will be displayed across the platform
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            User ID: {profile?.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AvatarSection } from "./profile/AvatarSection";
import { NameSection } from "./profile/NameSection";

export const ProfileSettings = () => {
  const navigate = useNavigate();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/auth");
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
        
        return data;
      } catch (error) {
        console.error("Error in profile query:", error);
        toast.error("Error loading profile");
        throw error;
      }
    },
  });

  if (error) {
    return <div>Error loading profile. Please try again.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarSection profile={profile} />
        {profile && <NameSection initialName={profile.name || ""} userId={profile.id} />}
      </CardContent>
    </Card>
  );
};

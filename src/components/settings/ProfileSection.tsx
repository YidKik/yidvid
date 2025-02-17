
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileInfo } from "./profile/ProfileInfo";
import { useQuery } from "@tanstack/react-query";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";

export const ProfileSection = () => {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
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
        .single();

      if (error) {
        toast.error("Error fetching profile");
        return null;
      }

      return data as ProfilesTable["Row"];
    },
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
        return;
      }
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("An error occurred while signing out");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        const { error } = await supabase.rpc('delete_user', {});
        if (error) {
          toast.error("Error deleting account");
          return;
        }
        await supabase.auth.signOut();
        navigate("/");
        toast.success("Account deleted successfully");
      } catch (error) {
        toast.error("An error occurred while deleting your account");
      }
    }
  };

  if (!profile) return null;

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
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="outline"
              className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};

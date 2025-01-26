import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/navigation/BackButton";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { MusicArtistsSection } from "@/components/dashboard/MusicArtistsSection";
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Check if user is admin
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data?.is_admin) {
        navigate("/");
        return null;
      }

      return data;
    },
  });

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <BackButton />
      <DashboardAnalytics />
      
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <UserManagementSection currentUserId={profile.id} />
      <CommentsManagementSection />
      <YouTubeChannelsSection />
      <MusicArtistsSection />
    </div>
  );
};

export default Dashboard;
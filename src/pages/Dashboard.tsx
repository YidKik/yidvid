
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { ReportedVideosSection } from "@/components/dashboard/ReportedVideosSection";
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";
import { MusicArtistsSection } from "@/components/dashboard/MusicArtistsSection";
import { ChannelRequestsSection } from "@/components/dashboard/ChannelRequestsSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      console.log("Fetching profile for user:", session.user.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load user profile");
        throw error;
      }

      console.log("Fetched profile:", data);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          Error loading dashboard. Please try again later.
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = profile?.is_admin === true;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <UserAnalyticsSection />
      
      {isAdmin && (
        <>
          <DashboardAnalytics />
          <UserManagementSection currentUserId={session?.user?.id || ""} />
          <ReportedVideosSection />
          <CommentsManagementSection />
          <MusicArtistsSection />
          <ChannelRequestsSection />
        </>
      )}

      {!isAdmin && (
        <div className="text-center text-gray-500 mt-8">
          You do not have admin access to view additional dashboard features.
        </div>
      )}
    </div>
  );
}

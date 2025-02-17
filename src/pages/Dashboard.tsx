
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDashboardCards } from "@/components/dashboard/AdminDashboardCards";
import { BackButton } from "@/components/navigation/BackButton";

export default function Dashboard() {
  // First query the session
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");
      return session;
    },
  });

  // Then query the profile with better error handling
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      console.log("Fetching profile for user:", session.user.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load user profile");
        throw error;
      }

      console.log("Fetched profile:", data);
      return data;
    },
    enabled: !!session?.user?.id,
    retry: 1,
  });

  // Query dashboard stats only if user is admin
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      console.log("Fetching dashboard stats...");
      const [channelsResponse, videosResponse, commentsResponse, usersResponse] = await Promise.all([
        supabase.from("youtube_channels").select("*", { count: "exact", head: true }),
        supabase.from("youtube_videos").select("*", { count: "exact", head: true }),
        supabase.from("video_comments").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true })
      ]);
      
      return {
        totalChannels: channelsResponse.count || 0,
        totalVideos: videosResponse.count || 0,
        totalComments: commentsResponse.count || 0,
        totalUsers: usersResponse.count || 0
      };
    },
    enabled: profile?.is_admin === true,
    retry: 1,
  });

  // Query notifications only if user is admin
  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      console.log("Fetching admin notifications...");
      const { data: notificationsData, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .eq("is_read", false);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return notificationsData;
    },
    enabled: profile?.is_admin === true,
    refetchInterval: 30000,
  });

  // Show loading state while checking session and profile
  if (isSessionLoading || isProfileLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (profileError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          Error loading dashboard. Please try again later.
        </div>
      </div>
    );
  }

  // Explicitly check admin status
  const isAdmin = profile?.is_admin === true;
  console.log("Is admin:", isAdmin, "Profile:", profile);

  return (
    <div className="container mx-auto py-12 space-y-8 px-4">
      <BackButton />
      <div className="flex items-center gap-4 mb-8">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
          alt="YidVid Logo"
          className="h-24 w-auto object-contain"
        />
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Your Dashboard</h1>
      </div>
      
      {isAdmin ? (
        <AdminDashboardCards stats={stats} notifications={notifications} />
      ) : (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            You do not have admin access to view additional dashboard features. 
            If you believe this is an error, please contact the system administrator.
          </div>
        </Card>
      )}
    </div>
  );
}

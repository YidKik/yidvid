import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/navigation/BackButton";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { MusicArtistsSection } from "@/components/dashboard/MusicArtistsSection";
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";
import { ReportedVideosSection } from "@/components/dashboard/ReportedVideosSection";
import { ChannelRequestsSection } from "@/components/dashboard/ChannelRequestsSection";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, Music, Video, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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

  // Fetch notification counts
  const { data: notificationCounts } = useQuery({
    queryKey: ["notification-counts"],
    queryFn: async () => {
      const [channelRequests, unreadComments] = await Promise.all([
        supabase
          .from("channel_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("admin_notifications")
          .select("id", { count: "exact", head: true })
          .eq("type", "new_comment")
          .eq("is_read", false)
      ]);

      return {
        overview: (channelRequests.count || 0),
        comments: (unreadComments.count || 0)
      };
    },
    enabled: !!profile?.is_admin,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!profile?.is_admin) {
    return null;
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <DashboardAnalytics />
            <ChannelRequestsSection />
          </>
        );
      case "users":
        return <UserManagementSection currentUserId={profile.id} />;
      case "youtube":
        return <YouTubeChannelsSection />;
      case "music":
        return <MusicArtistsSection />;
      case "comments":
        return (
          <>
            <CommentsManagementSection />
            <ReportedVideosSection />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <BackButton />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="flex justify-center w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-5 gap-4">
            <TabsTrigger value="overview" className="flex items-center gap-2 px-6 relative">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              {notificationCounts?.overview > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCounts.overview}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 px-6">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2 px-6">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">YouTube</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2 px-6">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Music</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2 px-6 relative">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
              {notificationCounts?.comments > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCounts.comments}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default Dashboard;
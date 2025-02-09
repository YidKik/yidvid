
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Video, MessageSquare, Tv, Database } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
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

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
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
    enabled: profile?.is_admin === true
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

  const adminCards = [
    {
      title: "Channel Management",
      description: "Add, remove, and manage YouTube channels",
      icon: <Tv className="h-6 w-6 text-muted-foreground" />,
      onClick: () => navigate("/admin/channels"),
      stats: stats?.totalChannels ? `${stats.totalChannels} channels` : undefined
    },
    {
      title: "Comments Management",
      description: "View and moderate comments",
      icon: <MessageSquare className="h-6 w-6 text-muted-foreground" />,
      onClick: () => navigate("/admin/comments"),
      stats: stats?.totalComments ? `${stats.totalComments} comments` : undefined
    },
    {
      title: "Channel Requests",
      description: "Review and manage channel requests",
      icon: <Video className="h-6 w-6 text-muted-foreground" />,
      onClick: () => navigate("/admin/requests")
    },
    {
      title: "User Management",
      description: "Manage users and admins",
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
      onClick: () => navigate("/admin/users"),
      stats: stats?.totalUsers ? `${stats.totalUsers} users` : undefined
    },
    {
      title: "Dashboard Analytics",
      description: "View overall statistics and analytics",
      icon: <Database className="h-6 w-6 text-muted-foreground" />,
      onClick: () => navigate("/admin/analytics"),
      stats: stats?.totalVideos ? `${stats.totalVideos} videos` : undefined
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <Card 
              key={index}
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={card.onClick}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  {card.icon}
                  {card.stats && (
                    <span className="text-sm text-muted-foreground">{card.stats}</span>
                  )}
                </div>
                <CardTitle className="mt-4">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          You do not have admin access to view additional dashboard features.
        </div>
      )}
    </div>
  );
}

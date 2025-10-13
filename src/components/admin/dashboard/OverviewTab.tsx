import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Shield, Users, FileText, BarChart3, Settings, 
  Video, MessageSquare, Bell, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Clock, Activity
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManager } from "@/hooks/useSessionManager";

export const OverviewTab = () => {
  const navigate = useNavigate();
  const { session, profile } = useSessionManager();
  const isAdmin = profile?.is_admin;
  const { stats } = useDashboardStats(isAdmin || false, session?.user?.id);

  const { data: videoStats } = useQuery({
    queryKey: ["video-moderation-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("content_analysis_status", { count: "exact" });
      
      if (error) throw error;
      
      const approved = data?.filter(v => v.content_analysis_status === 'approved').length || 0;
      const rejected = data?.filter(v => v.content_analysis_status === 'rejected').length || 0;
      const pending = data?.filter(v => v.content_analysis_status === 'pending' || !v.content_analysis_status).length || 0;
      const manualReview = data?.filter(v => v.content_analysis_status === 'manual_review').length || 0;
      
      return { approved, rejected, pending, manualReview, total: data?.length || 0 };
    },
    enabled: isAdmin,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["recent-admin-activity"],
    queryFn: async () => {
      const { data: videos } = await supabase
        .from("youtube_videos")
        .select("title, created_at, content_analysis_status")
        .order("created_at", { ascending: false })
        .limit(5);
      
      const { data: comments } = await supabase
        .from("video_comments")
        .select("content, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      return { videos: videos || [], comments: comments || [] };
    },
    enabled: isAdmin,
  });

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, description, onClick }: any) => (
    <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value?.toLocaleString() || 0}</div>
        {trendValue && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center gap-1 mt-2`}>
            <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trendValue} from last month
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Videos"
          value={stats?.totalVideos}
          icon={Video}
          trend="up"
          trendValue="+12%"
          description="All platform videos"
          onClick={() => navigate('/admin?tab=content')}
        />
        
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          trend="up"
          trendValue="+8%"
          description="Registered accounts"
          onClick={() => navigate('/admin?tab=users')}
        />
        
        <StatCard
          title="Total Channels"
          value={stats?.totalChannels}
          icon={Settings}
          trend="up"
          trendValue="+5%"
          description="Active channels"
          onClick={() => navigate('/admin?tab=content')}
        />
        
        <StatCard
          title="Comments"
          value={stats?.totalComments}
          icon={MessageSquare}
          trend="up"
          trendValue="+23%"
          description="User interactions"
          onClick={() => navigate('/admin?tab=content')}
        />
      </div>

      {/* AI Filtering Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              AI Content Filtering Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{videoStats?.approved || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{videoStats?.rejected || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{videoStats?.pending || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Manual Review</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{videoStats?.manualReview || 0}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <button
                onClick={() => navigate('/admin?tab=content-analysis')}
                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                View Detailed Analysis
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentActivity?.videos.slice(0, 3).map((video, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Video className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(video.created_at).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                    video.content_analysis_status === 'approved' ? 'bg-green-100 text-green-700' :
                    video.content_analysis_status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {video.content_analysis_status || 'pending'}
                  </span>
                </div>
              </div>
            ))}
            {recentActivity?.comments.slice(0, 2).map((comment, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{comment.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary" onClick={() => navigate('/admin?tab=content-analysis')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-purple-600" />
              AI Filtering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage AI-powered content moderation with detailed analysis, rejection reasons, and frame inspection
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-600 font-medium">{videoStats?.pending || 0} Pending</span>
              <span className="text-orange-600 font-medium">{videoStats?.manualReview || 0} Need Review</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary" onClick={() => navigate('/admin?tab=users')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-600" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage user accounts, permissions, and admin access with advanced controls
            </p>
            <div className="text-xs text-muted-foreground">
              {stats?.totalUsers || 0} registered users
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary" onClick={() => navigate('/admin?tab=content')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-green-600" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage videos, channels, comments, and reported content across the platform
            </p>
            <div className="text-xs text-muted-foreground">
              {stats?.totalVideos || 0} videos • {stats?.totalChannels || 0} channels
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary" onClick={() => navigate('/admin?tab=channel-categories')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-indigo-600" />
              Channel Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Organize channels with custom categories and bulk management tools
            </p>
            <div className="text-xs text-muted-foreground">
              Advanced category management
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary" onClick={() => navigate('/admin?tab=categories')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-pink-600" />
              Video Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage video categorization with bulk operations and individual controls
            </p>
            <div className="text-xs text-muted-foreground">
              Bulk & individual management
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary" onClick={() => navigate('/admin/analytics')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View detailed platform statistics, user behavior, and content performance
            </p>
            <div className="text-xs text-muted-foreground">
              Real-time insights
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

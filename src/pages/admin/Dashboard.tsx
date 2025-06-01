
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminDashboardCards } from "@/components/dashboard/AdminDashboardCards";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { GlobalNotificationsSection } from "@/components/dashboard/GlobalNotificationsSection";
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";
import { ContactRequestsSection } from "@/components/dashboard/ContactRequestsSection";
import { ChannelRequestsSection } from "@/components/dashboard/ChannelRequestsSection";
import { ReportedVideosSection } from "@/components/dashboard/ReportedVideosSection";
import { MusicArtistsSection } from "@/components/dashboard/MusicArtistsSection";
import { ChannelCategoryManager } from "@/components/admin/ChannelCategoryManager";
import { NonAdminContent } from "@/components/dashboard/NonAdminContent";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { useSessionManager } from "@/hooks/useSessionManager";
import { checkAdminStatus } from "@/utils/admin/check-admin-status";
import { Helmet } from "react-helmet";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, FileText, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const { session } = useSessionManager();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        await checkAdminStatus();
        setIsAdmin(true);
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminStatus();
  }, [session]);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!isAdmin) {
    return <NonAdminContent />;
  }

  return (
    <>
      <Helmet>
        <title>{getPageTitle('/admin')}</title>
        <meta name="description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="keywords" content={DEFAULT_META_KEYWORDS} />
        <meta property="og:title" content={getPageTitle('/admin')} />
        <meta property="og:description" content={DEFAULT_META_DESCRIPTION} />
        <meta property="og:image" content={DEFAULT_META_IMAGE} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle('/admin')} />
        <meta name="twitter:description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_META_IMAGE} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.origin + "/admin"} />
        <link rel="icon" href="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" />
      </Helmet>
      
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-muted p-1 rounded-full w-full sm:w-auto flex justify-center gap-2">
            <TabsTrigger 
              value="overview" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Content
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/channels')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Channels</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>Manage YouTube channels and videos</CardDescription>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Manage Channels
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/users')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>User management and permissions</CardDescription>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/comments')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>Moderate comments and feedback</CardDescription>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Manage Comments
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/analytics')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>View platform statistics</CardDescription>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            <AdminDashboardCards stats={{}} notifications={[]} />
            <DashboardAnalytics />
          </TabsContent>

          <TabsContent value="content" className="space-y-8">
            <YouTubeChannelsSection />
            <MusicArtistsSection />
            <CommentsManagementSection />
            <ReportedVideosSection />
            <ContactRequestsSection />
            <ChannelRequestsSection />
            <GlobalNotificationsSection 
              isOpen={showNotificationsDialog} 
              onClose={() => setShowNotificationsDialog(false)} 
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            <UserManagementSection currentUserId={session?.user?.id || ""} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <ChannelCategoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Dashboard;


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

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
            <GlobalNotificationsSection />
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

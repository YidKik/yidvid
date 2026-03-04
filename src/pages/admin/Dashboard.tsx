import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";
import { useSessionManager } from "@/hooks/useSessionManager";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { NonAdminContent } from "@/components/dashboard/NonAdminContent";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { OverviewPage } from "@/components/admin/pages/OverviewPage";
import { ContentModerationPage } from "@/components/admin/pages/ContentModerationPage";
import { VideosChannelsPage } from "@/components/admin/pages/VideosChannelsPage";
import { MusicPage } from "@/components/admin/pages/MusicPage";
import { UsersPage } from "@/components/admin/pages/UsersPage";
import { CategoriesPage } from "@/components/admin/pages/CategoriesPage";
import { CommentsPage } from "@/components/admin/pages/CommentsPage";
import { ContactRequestsPage } from "@/components/admin/pages/ContactRequestsPage";
import { NotificationsPage } from "@/components/admin/pages/NotificationsPage";
import { AnalyticsPage } from "@/components/admin/pages/AnalyticsPage";

const TAB_TITLES: Record<string, string> = {
  overview: "Overview",
  moderation: "Content Moderation",
  "videos-channels": "Videos & Channels",
  music: "Music Artists",
  users: "Users",
  categories: "Categories",
  comments: "Comments",
  "contact-requests": "Contact Requests",
  notifications: "Notifications",
  analytics: "Analytics",
};

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { session, isLoading: authLoading, profile } = useSessionManager();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    if (!session || authLoading) return;
    try {
      setIsAdmin(!!profile?.is_admin);
    } catch {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [session, profile, authLoading]);

  if (authLoading || isLoading) return <DashboardLoading />;
  if (isAdmin === false) return <NonAdminContent />;

  const handleTabChange = (tab: string) => setSearchParams({ tab });

  const renderPage = () => {
    switch (activeTab) {
      case "overview": return <OverviewPage />;
      case "moderation": return <ContentModerationPage />;
      case "videos-channels": return <VideosChannelsPage />;
      case "music": return <MusicPage />;
      case "users": return <UsersPage currentUserId={session?.user?.id || ""} />;
      case "categories": return <CategoriesPage />;
      case "comments": return <CommentsPage />;
      case "contact-requests": return <ContactRequestsPage />;
      case "notifications": return <NotificationsPage />;
      case "analytics": return <AnalyticsPage userId={session?.user?.id} />;
      default: return <OverviewPage />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle("/admin")}</title>
        <meta name="description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.origin + "/admin"} />
      </Helmet>

      <div className="flex h-screen overflow-hidden bg-[hsl(220,14%,96%)]">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader
            pageTitle={TAB_TITLES[activeTab] || "Overview"}
            profile={profile}
          />

          <main className="flex-1 overflow-y-auto p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

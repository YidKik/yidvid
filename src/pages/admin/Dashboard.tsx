import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getPageTitle } from "@/utils/pageTitle";
import { useSessionManager } from "@/hooks/useSessionManager";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { NonAdminContent } from "@/components/dashboard/NonAdminContent";
import { AdminSidebarV2 } from "@/components/admin-v2/layout/AdminSidebarV2";
import { AdminHeaderV2 } from "@/components/admin-v2/layout/AdminHeaderV2";
import { OverviewPageV2 } from "@/components/admin-v2/pages/OverviewPageV2";
import { useSecureAdminAuth } from "@/hooks/useSecureAdminAuth";
import { AdminPinDialog } from "@/components/settings/sections/admin/AdminPinDialog";

// Keep existing page components for now — they'll be rebuilt in subsequent phases
import { ContentModerationPage } from "@/components/admin/pages/ContentModerationPage";
import { ChannelsPageV2 } from "@/components/admin-v2/pages/ChannelsPageV2";

import { UsersPageV2 } from "@/components/admin-v2/pages/UsersPageV2";
import { CategoriesPageV2 } from "@/components/admin-v2/pages/CategoriesPageV2";
import { CommentsPageV2 } from "@/components/admin-v2/pages/CommentsPageV2";
import { ContactRequestsPageV2 } from "@/components/admin-v2/pages/ContactRequestsPageV2";
import { ChannelRequestsPageV2 } from "@/components/admin-v2/pages/ChannelRequestsPageV2";
import { ShortsPageV2 } from "@/components/admin-v2/pages/ShortsPageV2";
import { ReportedVideosPageV2 } from "@/components/admin-v2/pages/ReportedVideosPageV2";
import { EmailsPageV2 } from "@/components/admin-v2/pages/EmailsPageV2";

import { AnalyticsPageV2 } from "@/components/admin-v2/pages/AnalyticsPageV2";

const PAGE_META: Record<string, { title: string; description: string }> = {
  overview: { title: "Overview", description: "Dashboard summary & key metrics" },
  analytics: { title: "Analytics", description: "Site traffic & user analytics" },
  channels: { title: "Channels & Videos", description: "Manage YouTube channels & videos" },
  moderation: { title: "Moderation", description: "Review & moderate content" },
  shorts: { title: "Shorts", description: "Manage YouTube Shorts" },
  categories: { title: "Categories", description: "Manage channel & video categories" },
  
  users: { title: "Users", description: "Manage users & admin roles" },
  comments: { title: "Comments", description: "View & moderate comments" },
  contacts: { title: "Contact Requests", description: "Manage contact requests & emails" },
  requests: { title: "Channel Requests", description: "Review & manage channel requests from users" },
  reports: { title: "Reported Videos", description: "Monitor and review reported video content" },
  emails: { title: "Emails", description: "Monitor email delivery & send broadcasts" },
};

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { session, isLoading: authLoading, profile } = useSessionManager();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const {
    showPinDialog,
    setShowPinDialog,
    adminPin,
    setAdminPin,
    handlePinVerification,
    hasAdminSession
  } = useSecureAdminAuth();

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
  
  if (isAdmin === false && !hasAdminSession) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center">
        <NonAdminContent onEnterPin={() => setShowPinDialog(true)} />
        <AdminPinDialog
          showDialog={showPinDialog}
          setShowDialog={setShowPinDialog}
          pinValue={adminPin}
          setPinValue={setAdminPin}
          onUnlock={handlePinVerification}
        />
      </div>
    );
  }

  const handleTabChange = (tab: string) => setSearchParams({ tab });

  const meta = PAGE_META[activeTab] || PAGE_META.overview;

  const renderPage = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPageV2 />;
      case "analytics":
        return <AnalyticsPageV2 />;
      case "channels":
        return <ChannelsPageV2 />;
      case "shorts":
        return <ShortsPageV2 />;
      case "moderation":
        return <ContentModerationPage />;
      case "categories":
        return <CategoriesPageV2 />;
      case "users":
        return <UsersPageV2 currentUserId={session?.user?.id || ""} />;
      case "comments":
        return <CommentsPageV2 />;
      case "contacts":
        return <ContactRequestsPageV2 />;
      case "requests":
        return <ChannelRequestsPageV2 />;
      case "reports":
        return <ReportedVideosPageV2 />;
      case "emails":
        return <EmailsPageV2 />;
      default:
        return <OverviewPageV2 />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle("/admin")}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <div className="flex h-screen overflow-hidden bg-[#0a0b10]">
        <AdminSidebarV2
          activeTab={activeTab}
          onTabChange={handleTabChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeaderV2
            pageTitle={meta.title}
            pageDescription={meta.description}
            profile={profile}
            onTabChange={handleTabChange}
          />

          <main className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0a0b10]">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

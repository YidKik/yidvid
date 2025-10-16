
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { NonAdminContent } from "@/components/dashboard/NonAdminContent";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Helmet } from "react-helmet";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";
import { AdminSidebar } from "@/components/admin/dashboard/AdminSidebar";
import { OverviewTab } from "@/components/admin/dashboard/OverviewTab";
import { ContentTab } from "@/components/admin/dashboard/ContentTab";
import { ContentAnalysisTab } from "@/components/admin/dashboard/ContentAnalysisTab";
import { UsersTab } from "@/components/admin/dashboard/UsersTab";
import { CategoriesTab } from "@/components/admin/dashboard/CategoriesTab";
import { ChannelCategoryTab } from "@/components/admin/dashboard/ChannelCategoryTab";

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session, isLoading: authLoading, isAuthenticated, profile } = useSessionManager();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!session || authLoading) {
        return;
      }

      try {
        if (profile?.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminStatus();
  }, [session, profile, authLoading]);

  if (authLoading || isLoading) {
    return <DashboardLoading />;
  }

  if (isAdmin === false) {
    return <NonAdminContent />;
  }

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'content-analysis':
        return <ContentAnalysisTab />;
      case 'content':
        return <ContentTab />;
      case 'users':
        return <UsersTab currentUserId={session?.user?.id || ""} />;
      case 'channel-categories':
        return <ChannelCategoryTab />;
      case 'categories':
        return <CategoriesTab />;
      default:
        return <OverviewTab />;
    }
  };

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
      
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 w-full">
        {/* Left Sidebar */}
        <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your platform with advanced tools and insights
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Welcome back,</p>
                    <p className="font-semibold">{profile?.email || 'Admin'}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {profile?.email?.[0]?.toUpperCase() || 'A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[calc(100vh-12rem)]">
              {renderActiveTab()}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;

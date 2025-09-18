
import { useState, useEffect } from "react";
import { NonAdminContent } from "@/components/dashboard/NonAdminContent";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { useSessionManager } from "@/hooks/useSessionManager";
// Admin check handled via profile.is_admin to avoid race with secure session
import { Helmet } from "react-helmet";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";
import { DashboardTabs } from "@/components/admin/dashboard/DashboardTabs";

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session, isLoading: authLoading, isAuthenticated, profile } = useSessionManager();

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

        <DashboardTabs currentUserId={session?.user?.id || ""} />
      </div>
    </>
  );
};

export default Dashboard;

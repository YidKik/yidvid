
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/navigation/BackButton";
import { AdminDashboardCards } from "@/components/dashboard/AdminDashboardCards";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { NonAdminContent } from "@/components/dashboard/NonAdminContent";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  
  // Use our custom hooks to manage state and data fetching
  const { 
    isAdmin, 
    profile,
    isSessionLoading, 
    isProfileLoading, 
    isAdminCheckComplete 
  } = useAdminStatus(session?.user?.id);
  
  const { stats, isStatsLoading } = useDashboardStats(isAdmin, session?.user?.id);
  const { notifications } = useAdminNotifications(isAdmin);

  // Redirect non-admin users
  useEffect(() => {
    if (isAdminCheckComplete && profile !== undefined && !isAdmin) {
      console.log("User is not an admin, redirecting to home", profile);
      navigate("/");
    }
  }, [profile, isAdminCheckComplete, navigate, isAdmin]);

  // Show loading state while checking session and profile
  if (isSessionLoading || isProfileLoading || isStatsLoading || !isAdminCheckComplete) {
    return <DashboardLoading />;
  }

  console.log("Dashboard render - Is admin:", isAdmin, "Profile:", profile);

  return (
    <div className="container mx-auto py-12 space-y-8 px-4">
      <BackButton />
      
      <DashboardHeader 
        logoSrc="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
        title="Welcome to Your Dashboard" 
      />
      
      {isAdmin ? (
        <AdminDashboardCards stats={stats} notifications={notifications} />
      ) : (
        <NonAdminContent />
      )}
    </div>
  );
}

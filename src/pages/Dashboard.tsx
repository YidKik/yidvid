
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { ADMIN_PIN } from "@/hooks/useAdminPinDialog";
import { AdminPinDialog } from "@/components/settings/sections/admin/AdminPinDialog";
import { useAdminPinDialog } from "@/hooks/useAdminPinDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  
  // Use our custom hooks to manage state and data fetching
  const { 
    isAdmin, 
    profile,
    isSessionLoading, 
    isProfileLoading, 
    isAdminCheckComplete,
    hasPinBypass
  } = useAdminStatus(session?.user?.id);
  
  const { stats, isStatsLoading } = useDashboardStats(isAdmin || hasPinBypass, session?.user?.id);
  const { notifications } = useAdminNotifications(isAdmin || hasPinBypass);
  
  // Use the centralized admin PIN dialog hook
  const {
    showPinDialog,
    setShowPinDialog,
    adminPin,
    setAdminPin,
    handleUnlockWithPin
  } = useAdminPinDialog(session?.user?.id);

  // Show loading state while checking session and profile
  if (isSessionLoading || isProfileLoading || isStatsLoading || !isAdminCheckComplete) {
    return <DashboardLoading />;
  }

  console.log("Dashboard render - Is admin:", isAdmin, "Has PIN bypass:", hasPinBypass, "Profile:", profile);

  return (
    <div className="container mx-auto py-12 space-y-8 px-4">
      <BackButton />
      
      <DashboardHeader title="Welcome to Your Dashboard" />
      
      {(isAdmin || hasPinBypass) ? (
        <AdminDashboardCards stats={stats} notifications={notifications} />
      ) : (
        <div className="space-y-6">
          <NonAdminContent />
          
          <div className="flex justify-center mt-8">
            <Button 
              onClick={() => setShowPinDialog(true)}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              <Lock className="h-4 w-4" />
              Enter Admin PIN
            </Button>
          </div>
        </div>
      )}

      {/* Use the shared AdminPinDialog component */}
      <AdminPinDialog
        showDialog={showPinDialog}
        setShowDialog={setShowPinDialog}
        pinValue={adminPin}
        setPinValue={setAdminPin}
        onUnlock={handleUnlockWithPin}
      />
    </div>
  );
}

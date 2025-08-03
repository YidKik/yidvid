
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
import { Lock, Settings, Users, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useSecureAdminAuth } from "@/hooks/useSecureAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const {
    showPinDialog,
    setShowPinDialog,
    adminPin,
    setAdminPin,
    handlePinVerification,
    hasAdminSession
  } = useSecureAdminAuth();
  
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

  // Use secure PIN verification
  const handlePinSubmit = () => {
    handlePinVerification();
  };

  // Show loading state while checking session and profile
  if (isSessionLoading || isProfileLoading || isStatsLoading || !isAdminCheckComplete) {
    return <DashboardLoading />;
  }

  console.log("Dashboard render - Is admin:", isAdmin, "Has PIN bypass:", hasPinBypass, "Profile:", profile);

  return (
    <div className="container mx-auto py-12 space-y-8 px-4">
      <BackButton />
      
      <DashboardHeader title="Welcome to Your Dashboard" />
      
      {(isAdmin || hasPinBypass || hasAdminSession) ? (
        <div className="space-y-8">
          <AdminDashboardCards stats={stats} notifications={notifications} />
          
          {/* Admin Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Admin Quick Actions</h2>
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

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Full Dashboard</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>Access the complete admin dashboard</CardDescription>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Open Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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

      {/* Admin PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
            <DialogDescription>
              Enter the admin PIN to access the dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              maxLength={10}
              className="text-center text-lg tracking-widest"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePinSubmit();
                }
              }}
            />
            <Button onClick={handlePinSubmit}>Unlock</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

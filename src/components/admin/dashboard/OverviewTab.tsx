
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Settings, Users, FileText, BarChart3 } from "lucide-react";
import { AdminDashboardCards } from "@/components/dashboard/AdminDashboardCards";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";

export const OverviewTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
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

      <AdminDashboardCards stats={{
        totalChannels: 0,
        totalVideos: 0,
        totalComments: 0,
        totalUsers: 0
      }} notifications={[]} />
      <DashboardAnalytics />
    </div>
  );
};

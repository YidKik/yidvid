
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  MessageSquare, 
  Mail, 
  Youtube, 
  Music,
  Bell,
  AlertTriangle,
  BarChart3
} from "lucide-react";

interface AdminDashboardCardsProps {
  stats: any;
  notifications: any[];
}

export function AdminDashboardCards({ stats, notifications }: AdminDashboardCardsProps) {
  const navigate = useNavigate();

  const unreadNotifications = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* User Management */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/users')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User Management</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            Total users registered
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Manage Users
          </Button>
        </CardContent>
      </Card>

      {/* Comments Management */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/comments')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comments</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
          <p className="text-xs text-muted-foreground">
            Total comments posted
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Manage Comments
          </Button>
        </CardContent>
      </Card>

      {/* Contact Requests */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/contact-requests')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.pendingContactRequests || 0}</div>
          <p className="text-xs text-muted-foreground">
            Pending contact requests
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            View Requests
          </Button>
        </CardContent>
      </Card>

      {/* YouTube Channels */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/youtube-channels')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">YouTube Channels</CardTitle>
          <Youtube className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalChannels || 0}</div>
          <p className="text-xs text-muted-foreground">
            Active YouTube channels
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Manage Channels
          </Button>
        </CardContent>
      </Card>

      {/* Music Artists */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/music-artists')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Music Artists</CardTitle>
          <Music className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalArtists || 0}</div>
          <p className="text-xs text-muted-foreground">
            Music artists managed
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Manage Artists
          </Button>
        </CardContent>
      </Card>

      {/* Global Notifications */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/notifications')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unreadNotifications}</div>
          <p className="text-xs text-muted-foreground">
            Unread notifications
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Manage Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Reported Videos */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/reported-videos')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reported Videos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.reportedVideos || 0}</div>
          <p className="text-xs text-muted-foreground">
            Videos awaiting review
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Review Reports
          </Button>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/analytics')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Analytics</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalVideos || 0}</div>
          <p className="text-xs text-muted-foreground">
            Total videos in system
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            View Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

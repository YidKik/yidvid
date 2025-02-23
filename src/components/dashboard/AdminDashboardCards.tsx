
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Video, MessageSquare, Tv, Database, Film, Mail, Grid3X3, Flag, Bell, LayoutDashboard } from "lucide-react";
import { DashboardStats, AdminNotification } from "@/types/dashboard";

interface AdminDashboardCardsProps {
  stats?: DashboardStats;
  notifications?: AdminNotification[];
}

export const AdminDashboardCards = ({ stats, notifications }: AdminDashboardCardsProps) => {
  const navigate = useNavigate();

  const getNotificationCount = (type: string) => {
    return notifications?.filter(n => n.type === type).length || 0;
  };

  const adminCards = [
    {
      title: "Channel Management",
      description: "Add, remove, and manage YouTube channels",
      icon: <Tv className="h-7 w-7" />,
      onClick: () => navigate("/admin/channels"),
      stats: stats?.totalChannels ? `${stats.totalChannels} channels` : undefined,
      notifications: getNotificationCount("new_channel_request"),
      bgColor: "bg-[#F2FCE2]",
      iconColor: "text-green-600"
    },
    {
      title: "Category Management",
      description: "Manage video categories",
      icon: <Grid3X3 className="h-7 w-7" />,
      onClick: () => navigate("/admin/categories"),
      bgColor: "bg-[#E8F7FF]",
      iconColor: "text-blue-600"
    },
    {
      title: "Comments Management",
      description: "View and moderate comments",
      icon: <MessageSquare className="h-7 w-7" />,
      onClick: () => navigate("/admin/comments"),
      stats: stats?.totalComments ? `${stats.totalComments} comments` : undefined,
      notifications: getNotificationCount("new_comment"),
      bgColor: "bg-[#FEF7CD]",
      iconColor: "text-yellow-600"
    },
    {
      title: "Layout Customization",
      description: "Customize website layout and sections",
      icon: <LayoutDashboard className="h-7 w-7" />,
      onClick: () => navigate("/admin/layout"),
      bgColor: "bg-[#E2F5EA]",
      iconColor: "text-emerald-600"
    },
    {
      title: "Channel Requests",
      description: "Review and manage channel requests",
      icon: <Video className="h-7 w-7" />,
      onClick: () => navigate("/admin/requests"),
      notifications: getNotificationCount("new_channel_request"),
      bgColor: "bg-[#FEC6A1]",
      iconColor: "text-orange-600"
    },
    {
      title: "User Management",
      description: "Manage users and admins",
      icon: <Users className="h-7 w-7" />,
      onClick: () => navigate("/admin/users"),
      stats: stats?.totalUsers ? `${stats.totalUsers} users` : undefined,
      notifications: getNotificationCount("new_user"),
      bgColor: "bg-[#E5DEFF]",
      iconColor: "text-purple-600"
    },
    {
      title: "Dashboard Analytics",
      description: "View overall statistics and analytics",
      icon: <Database className="h-7 w-7" />,
      onClick: () => navigate("/admin/analytics"),
      stats: stats?.totalVideos ? `${stats.totalVideos} videos` : undefined,
      bgColor: "bg-[#FFDEE2]",
      iconColor: "text-pink-600"
    },
    {
      title: "Video Management",
      description: "View and manage all videos on the platform",
      icon: <Film className="h-7 w-7" />,
      onClick: () => navigate("/admin/videos"),
      stats: stats?.totalVideos ? `${stats.totalVideos} videos` : undefined,
      bgColor: "bg-[#E0F7FF]",
      iconColor: "text-blue-600"
    },
    {
      title: "Reported Videos",
      description: "Review reported videos and take action",
      icon: <Flag className="h-7 w-7" />,
      onClick: () => navigate("/admin/reported-videos"),
      bgColor: "bg-[#FFE0E0]",
      iconColor: "text-red-600"
    },
    {
      title: "Contact Requests",
      description: "Manage user contact and support requests",
      icon: <Mail className="h-7 w-7" />,
      onClick: () => navigate("/admin/contact-requests"),
      notifications: getNotificationCount("new_contact_request"),
      bgColor: "bg-[#FFE0FB]",
      iconColor: "text-purple-600"
    },
    {
      title: "Global Notifications",
      description: "Manage site-wide notifications and announcements",
      icon: <Bell className="h-7 w-7" />,
      onClick: () => navigate("/admin/notifications"),
      bgColor: "bg-[#FFF4E5]",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {adminCards.map((card, index) => (
        <Card 
          key={index}
          className={`relative transform transition-all duration-300 hover:scale-105 cursor-pointer border-none shadow-lg ${card.bgColor}`}
          onClick={card.onClick}
        >
          {card.notifications > 0 && (
            <div className="absolute -top-2 -right-2 z-10">
              <Badge 
                variant="destructive"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >
                {card.notifications}
              </Badge>
            </div>
          )}
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${card.bgColor} ${card.iconColor}`}>
                {card.icon}
              </div>
              {card.stats && (
                <span className="text-sm font-medium text-gray-600 bg-white/50 px-3 py-1 rounded-full">
                  {card.stats}
                </span>
              )}
            </div>
            <CardTitle className="mt-4 text-xl font-semibold text-gray-800">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 font-medium">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationsMenu } from "@/hooks/useNotificationsMenu";
import { NotificationsList } from "./notifications/NotificationsList";

interface NotificationsMenuProps {
  onMarkNotificationsAsRead?: () => Promise<void>;
}

export function NotificationsMenu({ onMarkNotificationsAsRead }: NotificationsMenuProps) {
  const {
    notifications,
    isLoading,
    unreadCount,
    handleNotificationClick,
    markAllAsRead,
    isAuthenticated
  } = useNotificationsMenu(onMarkNotificationsAsRead);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <NotificationsList 
          notifications={notifications}
          isLoading={isLoading}
          onNotificationClick={handleNotificationClick}
        />
      </PopoverContent>
    </Popover>
  );
}

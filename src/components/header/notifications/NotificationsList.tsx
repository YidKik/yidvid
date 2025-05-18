
import { Notification } from "@/hooks/useNotificationsMenu";
import { NotificationItem } from "./NotificationItem";
import { EmptyNotificationsState } from "./EmptyNotificationsState";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  onNotificationClick: (notification: Notification) => void;
}

export const NotificationsList = ({ 
  notifications, 
  isLoading, 
  onNotificationClick 
}: NotificationsListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (!notifications.length) {
    return <EmptyNotificationsState />;
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
};

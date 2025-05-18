
import { Notification } from "@/hooks/useNotificationsMenu";

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  return (
    <div 
      key={notification.id} 
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
      onClick={() => onClick(notification)}
    >
      <div className="flex gap-3">
        {notification.youtube_videos?.thumbnail && (
          <img 
            src={notification.youtube_videos.thumbnail} 
            alt="" 
            className="w-12 h-9 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
            New video: {notification.youtube_videos?.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {notification.youtube_videos?.channel_name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 bg-primary rounded-full self-start mt-2"></div>
        )}
      </div>
    </div>
  );
};

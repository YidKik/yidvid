
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
  notifications: any[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onNotificationClick: () => void;
}

export const NotificationList = ({ 
  notifications, 
  isLoading, 
  isError, 
  onRetry,
  onNotificationClick 
}: NotificationListProps) => {
  if (isLoading) {
    return (
      <div className="p-2 sm:p-6 text-center text-white/70 animate-fade-in">
        <p className="text-xs sm:text-sm">Loading notifications...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-2 sm:p-6 text-center text-white/70 animate-fade-in">
        <p className="text-xs sm:text-sm">Unable to load notifications</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="mt-1 text-white hover:text-white hover:bg-[#333333] h-6 text-[10px]"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="p-2 sm:p-6 text-center text-white/70 animate-fade-in">
        <p className="text-xs sm:text-sm">No new notifications</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-64px)] sm:h-[calc(100vh-100px)]">
      <div className="animate-fade-in">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onNotificationClick={onNotificationClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

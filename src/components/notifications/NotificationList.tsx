
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 text-center text-white/70 animate-fade-in">
        <p className="text-sm">Loading notifications...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 text-center text-white/70 animate-fade-in">
        <p className="text-sm">Unable to load notifications</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="mt-2 text-white hover:text-white hover:bg-[#333333] h-8 text-xs rounded-md"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="p-4 sm:p-6 text-center text-white/70 animate-fade-in">
        <p className="text-sm">No new notifications</p>
      </div>
    );
  }

  const ContentWrapper = isMobile ? 'div' : ScrollArea;
  
  return (
    <ContentWrapper className={isMobile ? 'h-full overflow-y-auto pb-24' : 'h-[calc(100vh-64px)] sm:h-[calc(100vh-100px)]'}>
      <div className="animate-fade-in">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onNotificationClick={onNotificationClick}
          />
        ))}
      </div>
    </ContentWrapper>
  );
};

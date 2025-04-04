
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationHeader } from "../notifications/NotificationHeader";
import { NotificationList } from "../notifications/NotificationList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "../notifications/useNotifications";
import { useMobileDrag } from "../notifications/useMobileDrag";

interface NotificationsMenuProps {
  session: any;
  onMarkAsRead: () => Promise<void>;
}

export const NotificationsMenu = ({ session, onMarkAsRead }: NotificationsMenuProps) => {
  const { isMobile } = useIsMobile();
  
  const {
    notifications,
    isLoading,
    isError,
    refetch,
    closeRef,
    handleClose,
    handleClearAll
  } = useNotifications(session?.user?.id);

  const {
    sheetContentRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useMobileDrag(handleClose, isMobile);

  if (!session?.user?.id) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-[#222222] hover:bg-[#333333] text-white relative h-7 w-7 md:h-10 md:w-10"
        >
          <Bell className="h-3.5 w-3.5 md:h-5 md:w-5" />
          {notifications && notifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-3 w-3 md:h-5 md:w-5 flex items-center justify-center p-0 text-[8px] md:text-xs"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetClose ref={closeRef} className="hidden" />
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={`
          ${isMobile ? 'w-full h-[100vh] rounded-t-xl' : 'w-[240px] sm:w-[400px] max-h-[80vh]'} 
          ${isMobile ? 'bg-[#222222]/90 backdrop-blur-md' : 'bg-[#222222] rounded-l-xl'} 
          border-[#333333] p-0
          ${isMobile ? 'animate-slide-up' : 'animate-slide-in-right'}
        `}
        ref={sheetContentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={isMobile ? 'relative' : ''}>
          {isMobile && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-500/50 rounded-full" />
          )}
          <NotificationHeader 
            hasNotifications={!!notifications?.length}
            onClearAll={handleClearAll}
            onClose={handleClose}
          />
          <NotificationList
            notifications={notifications || []}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            onNotificationClick={onMarkAsRead}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};


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
import { useLocation } from "react-router-dom";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface NotificationsMenuProps {
  onMarkAsRead: () => Promise<void>;
}

export const NotificationsMenu = ({ onMarkAsRead }: NotificationsMenuProps) => {
  const { isMobile } = useIsMobile();
  const location = useLocation();
  const isVideosPage = location.pathname === "/videos";
  const { isAuthenticated, user, isLoading } = useUnifiedAuth();
  
  const {
    notifications,
    isLoading: notificationsLoading,
    isError,
    refetch,
    closeRef,
    handleClose,
    handleClearAll
  } = useNotifications(user?.id);

  const {
    sheetContentRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useMobileDrag(handleClose, isMobile);

  console.log("NotificationsMenu state:", {
    isAuthenticated,
    userId: user?.id,
    isLoading,
    notificationsCount: notifications?.length || 0
  });

  // Only show notifications menu for authenticated users
  if (!isAuthenticated || isLoading) {
    return null;
  }

  // Consistent button styling to match other header buttons
  const buttonClass = `h-9 w-9 rounded-full ${isVideosPage
    ? "bg-[#ea384c] hover:bg-[#c82d3f] text-white"
    : "bg-[#222222] hover:bg-[#333333] text-white"} transition-all duration-300`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${buttonClass} relative`}
        >
          <Bell className="h-4 w-4" />
          {notifications && notifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-medium bg-red-500 text-white rounded-full"
            >
              {notifications.length > 9 ? '9+' : notifications.length}
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
            isLoading={notificationsLoading}
            isError={isError}
            onRetry={() => refetch()}
            onNotificationClick={onMarkAsRead}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

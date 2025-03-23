
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationHeader } from "../notifications/NotificationHeader";
import { NotificationList } from "../notifications/NotificationList";

interface NotificationsMenuProps {
  session: any;
  onMarkAsRead: () => Promise<void>;
}

export const NotificationsMenu = ({ session, onMarkAsRead }: NotificationsMenuProps) => {
  const { data: notifications, refetch, isError, error, isLoading } = useQuery({
    queryKey: ["video-notifications", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("No user session found");
        return [];
      }

      try {
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("video_notifications")
          .select(`
            *,
            youtube_videos (
              title,
              thumbnail,
              channel_name
            )
          `)
          .eq("user_id", session.user.id)
          .eq("is_read", false)
          .order("created_at", { ascending: false });

        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError);
          throw notificationsError;
        }

        const validNotifications = (notificationsData || []).filter(n => n.youtube_videos?.title);
        
        if (validNotifications.length === 0) {
          console.log("No valid notifications found");
        }
        
        return validNotifications;
      } catch (error: any) {
        const enhancedError = new Error(
          `Failed to fetch notifications: ${error.message || 'Unknown error'}`
        );
        console.error(enhancedError);
        throw enhancedError;
      }
    },
    enabled: !!session?.user?.id,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    meta: {
      errorMessage: "Unable to load notifications. Please try again later."
    }
  });

  if (isError && error) {
    console.error("Notifications error:", error);
  }

  const handleClearAll = async () => {
    if (!session?.user?.id || !notifications?.length) return;

    try {
      const { error } = await supabase
        .from("video_notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      if (error) throw error;

      await refetch();
      console.log("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      console.error("Failed to clear notifications");
    }
  };

  if (!session?.user?.id) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="bg-[#222222] hover:bg-[#333333] text-white relative h-7 w-7 md:h-10 md:w-10"
        disabled
      >
        <Bell className="h-3.5 w-3.5 md:h-5 md:w-5" />
      </Button>
    );
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
      <SheetContent 
        side="right"
        className="w-[240px] sm:w-[400px] bg-[#222222] border-[#333333] p-0"
      >
        <NotificationHeader 
          hasNotifications={!!notifications?.length}
          onClearAll={handleClearAll}
        />
        <NotificationList
          notifications={notifications || []}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onNotificationClick={onMarkAsRead}
        />
      </SheetContent>
    </Sheet>
  );
};

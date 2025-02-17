
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationsMenuProps {
  session: any;
  onMarkAsRead: () => Promise<void>;
}

export const NotificationsMenu = ({ session, onMarkAsRead }: NotificationsMenuProps) => {
  const navigate = useNavigate();

  const { data: notifications, refetch, isError, error, isLoading } = useQuery({
    queryKey: ["video-notifications", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("No user session found");
        return [];
      }

      try {
        // Fetch notifications first as they don't depend on quota
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

        // Check quota status separately - this won't block notifications
        try {
          const { data: quotaData } = await supabase
            .from('api_quota_tracking')
            .select('quota_remaining, quota_reset_at')
            .eq('api_name', 'youtube')
            .single();

          if (quotaData && quotaData.quota_remaining <= 0) {
            const resetTime = new Date(quotaData.quota_reset_at);
            console.warn(`YouTube API quota exceeded. Resets at ${resetTime.toLocaleString()}`);
            // Show quota warning to user but don't block notifications
            toast.warning(`YouTube API quota exceeded. Some features may be limited until ${resetTime.toLocaleString()}`);
          }
        } catch (quotaError) {
          // Don't throw on quota check error - just log it
          console.error("Error checking quota:", quotaError);
        }

        // Filter out notifications with missing video data
        const validNotifications = (notificationsData || []).filter(n => n.youtube_videos?.title);
        
        if (validNotifications.length === 0) {
          console.log("No valid notifications found");
        }
        
        return validNotifications;
      } catch (error: any) {
        // Add more context to the error
        const enhancedError = new Error(
          `Failed to fetch notifications: ${error.message || 'Unknown error'}`
        );
        console.error(enhancedError);
        throw enhancedError;
      }
    },
    enabled: !!session?.user?.id,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) return false;
      // Retry up to 3 times on network errors
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes
    meta: {
      errorMessage: "Unable to load notifications. Please try again later."
    }
  });

  // Show error toast when query fails, but only once
  if (isError && error) {
    console.error("Notifications error:", error);
    // We use toast.error which will automatically dedupe messages
    toast.error("Unable to load notifications. Please try again later.");
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
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  // Render loading state if no session yet
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
        <SheetHeader className="p-2 sm:p-6 border-b border-[#333333]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm sm:text-xl text-white">Notifications</SheetTitle>
            {notifications && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-[10px] text-white hover:text-white hover:bg-[#333333] h-6 px-2"
              >
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-64px)] sm:h-[calc(100vh-100px)]">
          {isLoading ? (
            <div className="p-2 sm:p-6 text-center text-white/70 animate-fade-in">
              <p className="text-xs sm:text-sm">Loading notifications...</p>
            </div>
          ) : isError ? (
            <div className="p-2 sm:p-6 text-center text-white/70 animate-fade-in">
              <p className="text-xs sm:text-sm">Unable to load notifications</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-1 text-white hover:text-white hover:bg-[#333333] h-6 text-[10px]"
              >
                Try Again
              </Button>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="animate-fade-in">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-1.5 sm:p-4 hover:bg-[#333333] cursor-pointer transition-colors duration-200 border-b border-[#333333] animate-fade-in"
                  onClick={() => {
                    navigate(`/video/${notification.video_id}`);
                    onMarkAsRead();
                  }}
                >
                  <div className="flex items-start gap-1.5">
                    <img
                      src={notification.youtube_videos.thumbnail}
                      alt={notification.youtube_videos.title}
                      className="w-12 sm:w-24 h-8 sm:h-16 object-cover rounded"
                      onError={(e) => {
                        console.error("Failed to load thumbnail");
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-sm text-white line-clamp-2 font-medium">
                        New video from {notification.youtube_videos.channel_name}
                      </p>
                      <p className="text-[9px] sm:text-xs text-white/70 mt-0.5 line-clamp-1 sm:line-clamp-2">
                        {notification.youtube_videos.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 sm:p-6 text-center text-white/70 animate-fade-in">
              <p className="text-xs sm:text-sm">No new notifications</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

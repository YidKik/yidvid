
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

  const { data: notifications, refetch, isError, error } = useQuery({
    queryKey: ["video-notifications", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
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

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!session?.user?.id,
    retry: 1, // Only retry once to avoid too many failed attempts
    meta: {
      errorMessage: "Unable to load notifications. Please try again later."
    }
  });

  // Show error toast when query fails
  if (isError && error) {
    console.error("Notifications error:", error);
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
              className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 md:h-5 md:w-5 flex items-center justify-center p-0 text-[8px] md:text-xs"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right"
        className="w-[280px] sm:w-[400px] bg-[#222222] border-[#333333] p-0"
      >
        <SheetHeader className="p-4 sm:p-6 border-b border-[#333333]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-lg sm:text-xl">Notifications</SheetTitle>
            {notifications && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs md:text-sm text-white hover:text-white hover:bg-[#333333]"
              >
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)]">
          {isError ? (
            <div className="p-4 sm:p-6 text-center text-white/70 animate-fade-in">
              <p className="text-sm sm:text-base">Unable to load notifications</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2 text-white hover:text-white hover:bg-[#333333]"
              >
                Try Again
              </Button>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="animate-fade-in">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 sm:p-4 hover:bg-[#333333] cursor-pointer transition-colors duration-200 border-b border-[#333333] animate-fade-in"
                  onClick={() => {
                    navigate(`/video/${notification.video_id}`);
                    onMarkAsRead();
                  }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <img
                      src={notification.youtube_videos.thumbnail}
                      alt={notification.youtube_videos.title}
                      className="w-16 sm:w-24 h-12 sm:h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-white line-clamp-2 font-medium">
                        New video from {notification.youtube_videos.channel_name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-white/70 mt-0.5 sm:mt-1 line-clamp-2">
                        {notification.youtube_videos.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 sm:p-6 text-center text-white/70 animate-fade-in">
              <p className="text-sm sm:text-base">No new notifications</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

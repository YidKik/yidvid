
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

interface NotificationsMenuProps {
  session: any;
  onMarkAsRead: () => Promise<void>;
}

export const NotificationsMenu = ({ session, onMarkAsRead }: NotificationsMenuProps) => {
  const navigate = useNavigate();

  const { data: notifications } = useQuery({
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

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

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
        className="w-full sm:w-[400px] bg-[#222222] border-[#333333] p-0"
      >
        <SheetHeader className="p-6 border-b border-[#333333]">
          <SheetTitle className="text-white text-xl">Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)]">
          {notifications && notifications.length > 0 ? (
            <div className="animate-fade-in">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-[#333333] cursor-pointer transition-colors duration-200 border-b border-[#333333] animate-fade-in"
                  onClick={() => {
                    navigate(`/video/${notification.video_id}`);
                    onMarkAsRead();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={notification.youtube_videos.thumbnail}
                      alt={notification.youtube_videos.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white line-clamp-2 font-medium">
                        New video from {notification.youtube_videos.channel_name}
                      </p>
                      <p className="text-xs text-white/70 mt-1 line-clamp-2">
                        {notification.youtube_videos.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-white/70 animate-fade-in">
              <p>No new notifications</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};


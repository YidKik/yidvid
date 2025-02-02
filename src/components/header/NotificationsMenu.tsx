import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-[#222222] border-[#333333] w-[280px] md:w-[300px] max-h-[60vh] md:max-h-[70vh]"
      >
        <ScrollArea className="h-[250px] md:h-[300px]">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-2 md:p-3 hover:bg-[#333333] cursor-pointer"
                onClick={() => {
                  navigate(`/video/${notification.video_id}`);
                  onMarkAsRead();
                }}
              >
                <div className="flex items-start gap-2">
                  <img
                    src={notification.youtube_videos.thumbnail}
                    alt={notification.youtube_videos.title}
                    className="w-14 h-10 md:w-16 md:h-12 object-cover rounded"
                  />
                  <div>
                    <p className="text-xs md:text-sm text-white line-clamp-2">
                      New video from {notification.youtube_videos.channel_name}
                    </p>
                    <p className="text-[10px] md:text-xs text-white/70 mt-0.5 line-clamp-1">
                      {notification.youtube_videos.title}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs md:text-sm text-white/70 p-3">No new notifications</p>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
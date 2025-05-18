
import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useSessionManager } from "@/hooks/useSessionManager";

interface NotificationsMenuProps {
  onMarkNotificationsAsRead?: () => Promise<void>;
}

export function NotificationsMenu({ onMarkNotificationsAsRead }: NotificationsMenuProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { session, isAuthenticated } = useSessionManager();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const { data: notificationsData, error } = await supabase
          .from("video_notifications")
          .select(`
            id,
            is_read,
            created_at,
            video_id,
            youtube_videos (
              id,
              title,
              thumbnail,
              channel_name
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        // Count unread notifications
        const unread = notificationsData?.filter(n => !n.is_read).length || 0;
        setUnreadCount(unread);
        setNotifications(notificationsData || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel("video_notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_notifications",
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isAuthenticated]);

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await supabase
          .from("video_notifications")
          .update({ is_read: true })
          .eq("id", notification.id);
        
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Navigate to video
      navigate(`/video/${notification.youtube_videos.id}`);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from("video_notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      
      // Call the parent component's handler if provided
      if (onMarkNotificationsAsRead) {
        await onMarkNotificationsAsRead();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
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
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground mb-2 opacity-60" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Subscribe to channels to get notified about new videos
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useSessionManager } from "@/hooks/useSessionManager";

export interface Notification {
  id: string;
  is_read: boolean;
  created_at: string;
  video_id: string;
  youtube_videos: {
    id: string;
    title: string;
    thumbnail: string;
    channel_name: string;
  };
}

export function useNotificationsMenu(onMarkNotificationsAsRead?: () => Promise<void>) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  const handleNotificationClick = async (notification: Notification) => {
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

  return {
    notifications,
    isLoading,
    unreadCount,
    handleNotificationClick,
    markAllAsRead,
    isAuthenticated
  };
}

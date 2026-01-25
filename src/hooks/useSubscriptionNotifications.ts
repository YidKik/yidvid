
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManager } from "@/hooks/useSessionManager";

interface VideoNotification {
  id: string;
  video_id: string;
  is_read: boolean;
  created_at: string;
  video: {
    id: string;
    video_id: string;
    title: string;
    thumbnail: string;
    channel_name: string;
    uploaded_at: string;
  } | null;
}

export const useSubscriptionNotifications = () => {
  const { session } = useSessionManager();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["subscription-notifications", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("video_notifications")
        .select(`
          id,
          video_id,
          is_read,
          created_at,
          youtube_videos!inner (
            id,
            video_id,
            title,
            thumbnail,
            channel_name,
            uploaded_at
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return (data || []).map((notification: any) => ({
        id: notification.id,
        video_id: notification.video_id,
        is_read: notification.is_read,
        created_at: notification.created_at,
        video: notification.youtube_videos || null,
      })) as VideoNotification[];
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("video_notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!userId) return;

      const { error } = await supabase
        .from("video_notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-notifications"] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    refetch,
  };
};

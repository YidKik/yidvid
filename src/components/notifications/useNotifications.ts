
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";

export interface Notification {
  id: string;
  video_id: string;
  youtube_videos: {
    title: string;
    thumbnail: string;
    channel_name: string;
  };
}

export const useNotifications = (userId: string | undefined) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  const { data: notifications, refetch, isError, error, isLoading } = useQuery({
    queryKey: ["video-notifications", userId],
    queryFn: async () => {
      if (!userId) {
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
          .eq("user_id", userId)
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
    enabled: !!userId,
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

  const handleClose = () => {
    if (closeRef.current) {
      closeRef.current.click();
    }
  };

  const handleClearAll = async () => {
    if (!userId || !notifications?.length) return;

    try {
      const { error } = await supabase
        .from("video_notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;

      await refetch();
      console.log("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      console.error("Failed to clear notifications");
    }
  };

  return {
    notifications,
    isLoading,
    isError,
    error,
    refetch,
    closeRef,
    handleClose,
    handleClearAll
  };
};

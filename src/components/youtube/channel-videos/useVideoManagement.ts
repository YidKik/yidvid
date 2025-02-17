
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video } from "@/types/channel-videos";

export const useVideoManagement = (channelId: string) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  const { data: videos, refetch, isError, isLoading } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      console.log("Fetching videos for channel:", channelId);
      
      try {
        // First check quota status
        const { data: quotaData, error: quotaError } = await supabase
          .from('api_quota_tracking')
          .select('quota_remaining, quota_reset_at')
          .eq('api_name', 'youtube')
          .single();

        if (quotaError) {
          console.warn("Could not check quota status:", quotaError);
        } else if (quotaData && quotaData.quota_remaining <= 0) {
          const resetTime = new Date(quotaData.quota_reset_at);
          const message = `YouTube API quota exceeded. Service will resume at ${resetTime.toLocaleString()}`;
          console.warn(message);
          toast.warning(message);
          // Still proceed to fetch cached videos
        }

        // Fetch videos from our database (these are cached)
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }

        console.log("Fetched videos:", data?.length || 0);
        return data as Video[];
      } catch (error: any) {
        // Enhance error message for quota exceeded
        if (error.message?.includes('quota exceeded')) {
          const enhancedError = new Error('Daily YouTube API quota exceeded. Only cached videos are available.');
          console.error(enhancedError);
          toast.error(enhancedError.message);
          // Return empty array instead of throwing
          return [];
        }

        console.error("Error in queryFn:", error);
        throw new Error(error.message || "Failed to fetch videos");
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry quota errors
      if (error.message?.includes('quota exceeded')) return false;
      // Retry network errors up to 3 times
      if (error.message?.includes('Failed to fetch')) return failureCount < 3;
      // Retry once for other errors
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    refetchOnWindowFocus: false,
  });

  const handleDeleteVideo = async (videoId: string) => {
    if (!videoId) return;
    
    try {
      setIsDeleting(true);
      console.log("Starting video deletion process for:", videoId);

      // First check if we can even execute the operation
      const { data: quotaData } = await supabase
        .from('api_quota_tracking')
        .select('quota_remaining')
        .eq('api_name', 'youtube')
        .single();

      if (quotaData?.quota_remaining <= 0) {
        toast.error("Cannot delete video: YouTube API quota exceeded");
        return;
      }

      const { error: notificationsError } = await supabase
        .from("video_notifications")
        .delete()
        .eq("video_id", videoId);

      if (notificationsError) {
        console.error("Error deleting notifications:", notificationsError);
        throw notificationsError;
      }

      const { error: reportsError } = await supabase
        .from("video_reports")
        .delete()
        .eq("video_id", videoId);

      if (reportsError) {
        console.error("Error deleting reports:", reportsError);
        throw reportsError;
      }

      const { error: commentsError } = await supabase
        .from("video_comments")
        .delete()
        .eq("video_id", videoId);

      if (commentsError) {
        console.error("Error deleting comments:", commentsError);
        throw commentsError;
      }

      const { error: historyError } = await supabase
        .from("video_history")
        .delete()
        .eq("video_id", videoId);

      if (historyError) {
        console.error("Error deleting history:", historyError);
        throw historyError;
      }

      const { error: interactionsError } = await supabase
        .from("user_video_interactions")
        .delete()
        .eq("video_id", videoId);

      if (interactionsError) {
        console.error("Error deleting interactions:", interactionsError);
        throw interactionsError;
      }

      const { error: videoError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("id", videoId);

      if (videoError) {
        console.error("Error deleting video:", videoError);
        throw videoError;
      }

      toast.success("Video deleted successfully");
      refetch();
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast.error(`Error deleting video: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  };

  return {
    videos,
    isLoading,
    isError,
    isDeleting,
    videoToDelete,
    refetch,
    handleDeleteVideo,
    setVideoToDelete,
  };
};

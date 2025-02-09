
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  views: number;
  uploaded_at: string;
}

export const useVideoManagement = (channelId: string) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  const { data: videos, refetch, isError, isLoading } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      console.log("Fetching videos for channel:", channelId);
      
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }

        console.log("Fetched videos:", data?.length || 0);
        return data as Video[];
      } catch (error: any) {
        console.error("Error in queryFn:", error);
        throw new Error(error.message || "Failed to fetch videos");
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const handleDeleteVideo = async (videoId: string) => {
    try {
      setIsDeleting(true);
      console.log("Starting video deletion process for:", videoId);

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
      toast.error("Error deleting video");
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

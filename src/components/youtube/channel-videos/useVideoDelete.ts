
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useVideoDelete = (refetchVideos: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

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
        toast.error("Cannot delete video: YouTube API quota exceeded", { id: "quota-exceeded" });
        return;
      }

      // Delete video custom category mappings first
      const { error: categoryMappingsError } = await supabase
        .from("video_custom_category_mappings")
        .delete()
        .eq("video_id", videoId);

      if (categoryMappingsError) {
        console.error("Error deleting category mappings:", categoryMappingsError);
        throw categoryMappingsError;
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

      toast.success("Video deleted successfully", { id: `video-deleted-${videoId}` });
      refetchVideos();
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast.error(`Error deleting video: ${error.message}`, { id: `video-delete-error-${videoId}` });
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  };

  return {
    isDeleting,
    videoToDelete,
    handleDeleteVideo,
    setVideoToDelete,
  };
};

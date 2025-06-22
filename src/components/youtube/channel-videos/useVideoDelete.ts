
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; 
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export const useVideoDelete = (refetchVideos: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const { user } = useUnifiedAuth();

  const handleDeleteVideo = async (videoId: string) => {
    if (!videoId || !user?.id) {
      toast.error("Authentication required to delete videos");
      return;
    }
    
    try {
      setIsDeleting(true);
      console.log("Starting video deletion process for:", videoId);

      // Use the new secure admin function
      const { data, error } = await supabase.rpc('admin_delete_video', {
        video_id_param: videoId,
        admin_user_id: user.id
      });

      if (error) {
        console.error("Error calling admin_delete_video:", error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        console.error("Video deletion failed:", data?.error);
        throw new Error(data?.error || "Failed to delete video");
      }

      console.log("Video deleted successfully");
      toast.success("Video deleted successfully", { 
        id: `video-deleted-${videoId}`
      });
      refetchVideos();
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast.error("Error deleting video: " + (error.message || "Unknown error"), { 
        id: "video-delete-error"
      });
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


import { useChannelVideos } from "./useChannelVideos";
import { useVideoDelete } from "./useVideoDelete";
import { toast } from "sonner";

export const useVideoManagement = (channelId: string) => {
  // Use the extracted hooks
  const { 
    data: videos, 
    refetch, 
    isError, 
    isLoading 
  } = useChannelVideos(channelId);

  const {
    isDeleting,
    videoToDelete,
    handleDeleteVideo,
    setVideoToDelete,
  } = useVideoDelete(refetch);

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

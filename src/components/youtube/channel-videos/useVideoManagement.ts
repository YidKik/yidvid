
import { useState } from "react";
import { useChannelVideos } from "./useChannelVideos";
import { useVideoDelete } from "./useVideoDelete";
import { toast } from "sonner";

export const useVideoManagement = (channelId: string) => {
  // Use the extracted hooks
  const { 
    data: videos, 
    refetch, 
    isError, 
    isLoading,
    error
  } = useChannelVideos(channelId);

  const {
    isDeleting,
    videoToDelete,
    handleDeleteVideo,
    setVideoToDelete,
  } = useVideoDelete(refetch);

  // Log more information about the error for debugging
  if (isError) {
    console.error("Error loading videos:", error);
  }

  return {
    videos,
    isLoading,
    isError,
    error,
    isDeleting,
    videoToDelete,
    refetch,
    handleDeleteVideo,
    setVideoToDelete,
  };
};

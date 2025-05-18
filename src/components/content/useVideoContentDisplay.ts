
import { useState, useEffect } from 'react';
import { VideoData } from '@/hooks/video/types/video-fetcher';
import { useSampleVideos } from '@/hooks/video/useSampleVideos';
import { useRefetchControl } from '@/hooks/video/useRefetchControl';

interface UseVideoContentDisplayProps {
  videos: VideoData[];
  isLoading: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
}

export const useVideoContentDisplay = ({
  videos,
  isLoading,
  refetch,
  forceRefetch
}: UseVideoContentDisplayProps) => {
  // Refetch control hook
  const { 
    isRefreshing, 
    handleRefetch, 
    handleForceRefetch 
  } = useRefetchControl({ refetch, forceRefetch });
  
  // Sample videos hook
  const { createSampleVideos, hasOnlySampleVideos } = useSampleVideos();

  // Always show some content immediately, whether user is logged in or not
  const displayVideos = videos?.length ? videos : createSampleVideos(8);
  
  return {
    displayVideos,
    isRefreshing,
    handleRefetch,
    handleForceRefetch,
    hasOnlySampleVideos: hasOnlySampleVideos(videos)
  };
};

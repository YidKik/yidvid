import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useVideos } from './video/useVideos';
import { useChannelsGrid } from './channel/useChannelsGrid';

export const useContentPreloader = (shouldPreload: boolean = false) => {
  const [preloadComplete, setPreloadComplete] = useState(false);
  const [imagesCached, setImagesCached] = useState(false);
  const queryClient = useQueryClient();

  // Preload video and channel data
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels: channels, isLoading: channelsLoading } = useChannelsGrid();

  // Function to preload images
  const preloadImages = async (imageUrls: string[]) => {
    const promises = imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Resolve even on error to not block the process
        img.src = url;
      });
    });

    try {
      await Promise.all(promises);
      console.info('Content preloader: All images cached successfully');
      setImagesCached(true);
    } catch (error) {
      console.warn('Content preloader: Some images failed to cache, continuing anyway');
      setImagesCached(true);
    }
  };

  useEffect(() => {
    if (!shouldPreload) return;

    const preloadContent = async () => {
      try {
        // Wait for data to be available
        if (videosLoading || channelsLoading || !videos || !channels) {
          return;
        }

        console.info('Content preloader: Starting image preload...');

        // Collect all image URLs from videos and channels
        const videoThumbnails = videos
          .slice(0, 50) // Preload first 50 videos for performance
          .map(video => video.thumbnail)
          .filter(Boolean);

        const channelAvatars = channels
          .slice(0, 50) // Preload first 50 channels for performance
          .map(channel => channel.thumbnail_url)
          .filter(Boolean);

        const allImageUrls = [...videoThumbnails, ...channelAvatars];

        // Preload images in batches to avoid overwhelming the browser
        const batchSize = 10;
        for (let i = 0; i < allImageUrls.length; i += batchSize) {
          const batch = allImageUrls.slice(i, i + batchSize);
          await preloadImages(batch);
          
          // Small delay between batches to prevent browser overload
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setPreloadComplete(true);
        console.info('Content preloader: Preloading completed successfully');
      } catch (error) {
        console.error('Content preloader: Error during preload:', error);
        // Set as complete anyway to not block the user experience
        setPreloadComplete(true);
      }
    };

    preloadContent();
  }, [shouldPreload, videos, channels, videosLoading, channelsLoading]);

  // Prefetch query data for instant access
  useEffect(() => {
    if (shouldPreload && !videosLoading && !channelsLoading) {
      // Ensure data is available in cache
      queryClient.prefetchQuery({
        queryKey: ["videos"],
        staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
      });

      queryClient.prefetchQuery({
        queryKey: ["channels"],
        staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
      });
    }
  }, [shouldPreload, videosLoading, channelsLoading, queryClient]);

  return {
    preloadComplete,
    imagesCached,
    isPreloading: shouldPreload && (!preloadComplete || videosLoading || channelsLoading),
    videosReady: !videosLoading && !!videos,
    channelsReady: !channelsLoading && !!channels
  };
};
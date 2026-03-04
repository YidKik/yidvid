import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useVideos } from './video/useVideos';
import { useChannelsGrid } from './channel/useChannelsGrid';

export const useContentPreloader = (shouldPreload: boolean = false) => {
  const [preloadComplete, setPreloadComplete] = useState(false);
  const [imagesCached, setImagesCached] = useState(false);

  // Preload video and channel data - these use cached queries now
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels: channels, isLoading: channelsLoading } = useChannelsGrid();

  useEffect(() => {
    if (!shouldPreload) return;
    if (videosLoading || channelsLoading || !videos || !channels) return;

    // Preload only first 20 thumbnails for fast initial paint
    const imageUrls = [
      ...videos.slice(0, 20).map(v => v.thumbnail).filter(Boolean),
      ...channels.slice(0, 10).map(c => c.thumbnail_url).filter(Boolean) as string[],
    ];

    // Use a single batch with requestIdleCallback for non-blocking preload
    const preload = () => {
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
      setImagesCached(true);
      setPreloadComplete(true);
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload);
    } else {
      setTimeout(preload, 200);
    }
  }, [shouldPreload, videos, channels, videosLoading, channelsLoading]);

  return {
    preloadComplete,
    imagesCached,
    isPreloading: shouldPreload && (!preloadComplete || videosLoading || channelsLoading),
    videosReady: !videosLoading && !!videos,
    channelsReady: !channelsLoading && !!channels
  };
};

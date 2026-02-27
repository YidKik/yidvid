
import React from 'react';
import { DesktopVideoView } from './DesktopVideoView';
import { VideoData } from '@/hooks/video/types/video-fetcher';
import { AutoRefreshHandler } from './AutoRefreshHandler';

interface VideoContentDisplayProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  handleRefetch: () => Promise<any>;
  handleForceRefetch: () => Promise<any>;
  selectedCategory?: string;
  sortBy?: string;
  viewChannels?: boolean;
}

export const VideoContentDisplay: React.FC<VideoContentDisplayProps> = ({
  videos,
  isLoading,
  isRefreshing,
  lastSuccessfulFetch,
  fetchAttempts,
  forceRefetch,
  handleRefetch,
  handleForceRefetch,
  selectedCategory = "all",
  sortBy,
  viewChannels = false
}) => {
  if ((isLoading || isRefreshing) && videos.length === 0) {
    return null;
  }

  return (
    <div>
      <AutoRefreshHandler
        videos={videos}
        isRefreshing={isRefreshing}
        lastSuccessfulFetch={lastSuccessfulFetch}
        forceRefetch={forceRefetch}
      />
      
      <DesktopVideoView
        videos={videos}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        refetch={handleRefetch}
        forceRefetch={handleForceRefetch}
        lastSuccessfulFetch={lastSuccessfulFetch}
        fetchAttempts={fetchAttempts || 0}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        viewChannels={viewChannels}
      />
    </div>
  );
};

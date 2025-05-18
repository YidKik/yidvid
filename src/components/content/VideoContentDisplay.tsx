
import React from 'react';
import { MobileVideoView } from './MobileVideoView';
import { DesktopVideoView } from './DesktopVideoView';
import { useIsMobile } from '@/hooks/use-mobile';
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
}

export const VideoContentDisplay: React.FC<VideoContentDisplayProps> = ({
  videos,
  isLoading,
  isRefreshing,
  lastSuccessfulFetch,
  fetchAttempts,
  forceRefetch,
  handleRefetch,
  handleForceRefetch
}) => {
  const { isMobile } = useIsMobile();

  return (
    <div>
      {/* Component to handle automatic refresh of stale content */}
      <AutoRefreshHandler
        videos={videos}
        isRefreshing={isRefreshing}
        lastSuccessfulFetch={lastSuccessfulFetch}
        forceRefetch={forceRefetch}
      />
      
      {/* Responsive video view based on device */}
      {isMobile ? (
        <MobileVideoView
          videos={videos}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      ) : (
        <DesktopVideoView
          videos={videos}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      )}
    </div>
  );
};

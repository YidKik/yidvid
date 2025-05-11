
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";

export interface VideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  isMobile?: boolean;
  isTablet?: boolean;
}

export const VideoView = ({
  videos,
  isLoading,
  isRefreshing,
  isMobile = false,
  isTablet = false
}: VideoViewProps) => {
  // For mobile: 4 videos (2 rows of 2)
  // For tablet: 9 videos (3 rows of 3)
  // For desktop: 12 videos (3 rows of 4)
  const videosPerPage = isMobile ? 4 : (isTablet ? 9 : 12);
  const rowSize = isMobile ? 2 : (isTablet ? 3 : 4);
  
  const {
    sortedVideos,
    displayVideos,
    currentPage,
    totalPages,
    setCurrentPage,
    showMoreMobile,
    setShowMoreMobile
  } = useVideoPagination({
    videos,
    videosPerPage,
    isMobile
  });

  // If loading is taking longer than 1 second, show the gradient loading animation
  if (isLoading || isRefreshing) {
    return (
      <DelayedLoadingAnimation
        size={isMobile ? "small" : "large"}
        text={isRefreshing ? "Refreshing videos..." : "Loading videos..."}
        delayMs={1000}
      />
    );
  }

  return {
    sortedVideos,
    displayVideos,
    currentPage,
    totalPages,
    setCurrentPage,
    showMoreMobile,
    setShowMoreMobile,
    videosPerPage,
    rowSize,
    isLoading,
    isRefreshing
  };
};


import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";

export interface VideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  isMobile?: boolean;
}

export const VideoView = ({
  videos,
  isLoading,
  isRefreshing,
  isMobile = false
}: VideoViewProps) => {
  const videosPerPage = isMobile ? 4 : 12;
  const rowSize = isMobile ? 2 : 4;
  
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

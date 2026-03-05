
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";
import { Loader2 } from "lucide-react";

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

  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
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

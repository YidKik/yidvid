import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useRefetchControl } from "@/hooks/video/useRefetchControl";

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
  forceRefetch,
}: UseVideoContentDisplayProps) => {
  const { isRefreshing, handleRefetch, handleForceRefetch } = useRefetchControl({
    refetch,
    forceRefetch,
  });

  // IMPORTANT: Do not show sample/template videos while loading.
  // Only render real videos once they are available.
  const displayVideos = videos;

  return {
    displayVideos,
    isRefreshing,
    handleRefetch,
    handleForceRefetch,
  };
};


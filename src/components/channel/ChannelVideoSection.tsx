import { ChannelVideos } from "@/components/channel/ChannelVideos";
import { Loader2 } from "lucide-react";

interface ChannelVideoSectionProps {
  isLoadingVideos: boolean;
  hasVideosError: boolean;
  videosError?: Error;
  displayedVideos: any[];
  channelThumbnail: string;
  INITIAL_VIDEOS_COUNT: number;
  isLoadingMore: boolean;
  refetchVideos: () => void;
}

export const ChannelVideoSection = ({
  isLoadingVideos,
  hasVideosError,
  videosError,
  displayedVideos,
  channelThumbnail,
  INITIAL_VIDEOS_COUNT,
  isLoadingMore,
  refetchVideos
}: ChannelVideoSectionProps) => {
  // Show spinner while loading or on error with no data
  if (isLoadingVideos || (hasVideosError && (!displayedVideos || displayedVideos.length === 0))) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No videos and done loading — show empty space
  if (!displayedVideos || displayedVideos.length === 0) {
    return <div className="min-h-[200px]" />;
  }

  return (
    <ChannelVideos
      videos={displayedVideos}
      isLoading={isLoadingVideos}
      channelThumbnail={channelThumbnail}
      initialCount={displayedVideos.length}
      isLoadingMore={isLoadingMore}
    />
  );
};

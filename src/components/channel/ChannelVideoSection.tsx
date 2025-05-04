import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";
import { ChannelVideos } from "@/components/channel/ChannelVideos";
import { Button } from "@/components/ui/button";

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
  // Only show an error if we actually have an error AND there are no videos
  if (hasVideosError && (!displayedVideos || displayedVideos.length === 0)) {
    return (
      <div className="text-center my-12 p-6 border border-gray-100 rounded-lg bg-white/50">
        <VideoPlaceholder size="small" />
        <h3 className="text-lg font-medium mt-4">Error loading videos</h3>
        <p className="text-muted-foreground mt-2">
          {videosError instanceof Error ? videosError.message : "There was an error loading videos for this channel."}
        </p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={refetchVideos}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Only show the "no videos" message if we're not loading AND there are no videos
  if (!isLoadingVideos && (!displayedVideos || displayedVideos.length === 0)) {
    return (
      <div className="text-center my-12 p-6 border border-gray-100 rounded-lg bg-white/50">
        <VideoPlaceholder size="small" />
        <h3 className="text-lg font-medium mt-4">No videos found</h3>
        <p className="text-muted-foreground mt-2">
          This channel doesn't have any videos yet, or they're still being processed.
        </p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={refetchVideos}
        >
          Refresh Videos
        </Button>
      </div>
    );
  }

  // Log sorted videos for debugging
  console.log("Rendering videos sorted by uploaded_at:", 
    displayedVideos?.length > 0 ? 
    displayedVideos.map(v => ({
      title: v.title,
      uploaded_at: v.uploaded_at
    })) : "No videos");

  // Otherwise show videos (or loading state within the ChannelVideos component)
  return (
    <ChannelVideos
      videos={displayedVideos}
      isLoading={isLoadingVideos}
      channelThumbnail={channelThumbnail}
      initialCount={INITIAL_VIDEOS_COUNT}
      isLoadingMore={isLoadingMore}
    />
  );
};

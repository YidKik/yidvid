
import { VideoCard } from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ChannelVideosProps {
  videos: any[];
  isLoading: boolean;
  channelThumbnail: string;
  initialCount: number;
  isLoadingMore?: boolean;
}

export const ChannelVideos = ({
  videos,
  isLoading,
  channelThumbnail,
  initialCount,
  isLoadingMore,
}: ChannelVideosProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
        {Array.from({ length: initialCount }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="opacity-0"
            style={{ 
              animation: `fadeIn 0.6s ease-out ${0.5 + index * 0.1}s forwards`
            }}
          >
            <VideoCard
              id={video.video_id}
              uuid={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              channelName={video.channel_name}
              views={video.views || 0}
              uploadedAt={video.uploaded_at}
              channelId={video.channel_id}
              channelThumbnail={channelThumbnail}
            />
          </div>
        ))}
      </div>
      {isLoadingMore && (
        <div className="flex justify-center mt-6 md:mt-8">
          <p className="text-sm md:text-base text-muted-foreground">Loading more videos...</p>
        </div>
      )}
    </>
  );
};

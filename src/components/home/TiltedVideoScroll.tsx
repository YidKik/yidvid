
import { cn } from "@/lib/utils";
import { VideoGridItem } from "@/hooks/video/useVideoGridData";
import { VideoCard } from "@/components/VideoCard";
import { FlipCard, FlipCardFront, FlipCardBack } from "@/components/ui/flip-card";

interface TiltedVideoScrollProps {
  videos?: VideoGridItem[];
  className?: string;
  reverse?: boolean;
}

export function TiltedVideoScroll({ 
  videos = [],
  className,
  reverse = false
}: TiltedVideoScrollProps) {
  const scrollVideos = [...videos, ...videos];

  const formatViews = (views: number | null) => {
    if (!views) return "No views";
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views/1000).toFixed(1)}K views`;
    return `${(views/1000000).toFixed(1)}M views`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={cn("flex items-center justify-center w-full", className)}>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%-5rem),transparent)]">
        <div className={cn(
          "grid h-[350px] w-full gap-4 grid-flow-col auto-cols-[280px]",
          reverse ? "animate-scroll-x-reverse" : "animate-scroll-x"
        )}>
          {scrollVideos.map((video, index) => (
            <FlipCard
              key={`${video.id}-${index}`}
              className="h-full w-full"
              flipDirection="horizontal"
            >
              <FlipCardFront className="rounded-lg overflow-hidden">
                <VideoCard
                  id={video.id}
                  video_id={video.video_id}
                  title={video.title}
                  thumbnail={video.thumbnail}
                  channelName={video.channel_name}
                  channelId={video.channel_id}
                  views={video.views}
                  uploadedAt={video.uploaded_at}
                  hideInfo={true}
                />
              </FlipCardFront>
              <FlipCardBack className="rounded-lg overflow-hidden bg-gradient-to-br from-black/90 to-gray-800/90 p-4 flex flex-col justify-center text-white backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{video.title}</h3>
                <div className="space-y-2 text-sm opacity-90">
                  <p>{video.channel_name}</p>
                  <p>{formatViews(video.views)}</p>
                  <p>Uploaded {formatDate(video.uploaded_at)}</p>
                </div>
              </FlipCardBack>
            </FlipCard>
          ))}
        </div>
      </div>
    </div>
  );
}

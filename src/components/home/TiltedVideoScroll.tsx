
import { cn } from "@/lib/utils";
import { VideoGridItem } from "@/hooks/video/useVideoGridData";
import { FlipCard, FlipCardFront, FlipCardBack } from "@/components/ui/flip-card";
import { formatDistanceToNow } from "date-fns";

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
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
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
            >
              <FlipCardFront className="group h-full w-full rounded-md">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover rounded-md"
                />
              </FlipCardFront>
              <FlipCardBack className="flex flex-col justify-center rounded-md bg-black/90 p-4 text-white">
                <h3 className="text-sm font-medium line-clamp-2 mb-2">
                  {video.title}
                </h3>
                <div className="space-y-1 text-xs text-gray-300">
                  <p>{formatViews(video.views)}</p>
                  <p>
                    {formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true })}
                  </p>
                  <p className="text-gray-400">{video.channelName}</p>
                </div>
              </FlipCardBack>
            </FlipCard>
          ))}
        </div>
      </div>
    </div>
  );
}

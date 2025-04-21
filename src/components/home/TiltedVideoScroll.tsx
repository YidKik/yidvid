
import { cn } from "@/lib/utils";
import { VideoGridItem } from "@/hooks/video/useVideoGridData";
import { VideoCard } from "@/components/VideoCard";

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
  // Double the videos array to create a seamless scroll effect
  const scrollVideos = [...videos, ...videos];

  return (
    <div className={cn("flex items-center justify-center w-full", className)}>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%-5rem),transparent)]">
        <div className={cn(
          "grid h-[350px] w-full gap-4 grid-flow-col auto-cols-[280px]",
          reverse ? "animate-scroll-x-reverse" : "animate-scroll-x"
        )}>
          {scrollVideos.map((video, index) => (
            <div
              key={`${video.id}-${index}`}
              className="group flex items-start cursor-pointer rounded-md p-2 transition-all duration-300 ease-in-out hover:scale-105"
            >
              <VideoCard
                id={video.id}
                video_id={video.video_id}
                title={video.title}
                thumbnail={video.thumbnail}
                channelName={video.channelName}
                channelId={video.channelId}
                views={video.views}
                uploadedAt={video.uploadedAt}
                hideInfo={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

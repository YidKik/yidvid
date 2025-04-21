
import { cn } from "@/lib/utils";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { AspectRatio } from "@/components/ui/aspect-ratio";

/**
 * MINIMAL variant for hero/home showcase: Just show video thumbnails, nothing else!
 * This disables all overlays, meta, and info. Used on homepage backgrounds.
 */
export const VideoGridItem = ({ video }: { video: VideoItemType }) => {
  return (
    <div className={cn("w-full h-full rounded-lg overflow-hidden")}>
      <AspectRatio ratio={16/9}>
        <img
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </AspectRatio>
    </div>
  );
};

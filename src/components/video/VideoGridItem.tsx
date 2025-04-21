
import { cn } from "@/lib/utils";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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

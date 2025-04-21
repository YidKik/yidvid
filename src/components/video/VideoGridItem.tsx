
import { cn } from "@/lib/utils";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { Link } from "react-router-dom";

/**
 * MINIMAL variant for hero/home showcase: Just show video thumbnails, nothing else!
 * This disables all overlays, meta, and info. Used on homepage backgrounds.
 * If `clickable` is true, wrap in <Link> to video page.
 */
export const VideoGridItem = ({
  video,
  clickable = false,
}: { video: VideoItemType; clickable?: boolean }) => {
  const thumbnail = (
    <div className={cn("w-full h-full rounded-lg overflow-hidden")}>
      <img
        src={video.thumbnail || "/placeholder.svg"}
        alt=""
        className="w-full h-full object-cover transition-all"
        draggable={false}
        style={{ aspectRatio: "16/9" }}
      />
    </div>
  );
  if (clickable) {
    return (
      <Link to={`/video/${video.video_id || video.id}`}>
        {thumbnail}
      </Link>
    );
  }
  return thumbnail;
};


import { cn } from "@/lib/utils";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { Link } from "react-router-dom";

/**
 * MINIMAL variant for hero/home showcase: Just show video thumbnails, nothing else!
 * This disables all overlays, meta, and info. Used on homepage backgrounds.
 */
export const VideoGridItem = ({
  video,
  noRadius = false,
}: { video: VideoItemType; noRadius?: boolean }) => {
  return (
    <Link
      to={`/video/${video.id}`}
      tabIndex={0}
      aria-label={`View video: ${video.title || "Untitled video"}`}
      className={cn(
        "block focus:outline-none focus:ring-2 focus:ring-primary",
        "w-full h-full overflow-hidden",
        noRadius ? "rounded-md" : "rounded-lg"
      )}
      style={{
        aspectRatio: "16 / 9",
        width: "100%",
        height: "100%",
        minWidth: "100%",
        minHeight: "100%"
      }}
      draggable={false}
    >
      <img
        src={video.thumbnail || "/placeholder.svg"}
        alt={video.title || ""}
        className="w-full h-full object-cover"
        draggable={false}
        style={{
          aspectRatio: "16 / 9",
          width: "100%",
          height: "100%",
          minWidth: "100%",
          minHeight: "100%",
          objectFit: "cover"
        }}
      />
    </Link>
  );
};

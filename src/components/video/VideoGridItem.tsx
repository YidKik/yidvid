
import { cn } from "@/lib/utils";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

/**
 * MINIMAL variant for hero/home showcase: Just show video thumbnails, nothing else!
 * This disables all overlays, meta, and info. Used on homepage backgrounds.
 */
export const VideoGridItem = ({
  video,
  noRadius = false,
}: { video: VideoItemType; noRadius?: boolean }) => {
  return (
    <div
      className={cn(
        "w-full h-full overflow-hidden",
        noRadius ? "rounded-md" : "rounded-lg"
      )}
      style={{
        aspectRatio: "16 / 9",
        width: "100%",
        height: "100%",
        minWidth: "100%", // Ensure no constraints on minimum width
        minHeight: "100%" // Ensure no constraints on minimum height
      }}
    >
      <img
        src={video.thumbnail || "/placeholder.svg"}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
        style={{
          aspectRatio: "16 / 9",
          width: "100%",
          height: "100%",
          minWidth: "100%", // Ensure image fills container
          minHeight: "100%", // Ensure image fills container
          objectFit: "cover" // Ensure proper scaling
        }}
      />
    </div>
  );
};

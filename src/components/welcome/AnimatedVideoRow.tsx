
import { useEffect, useMemo } from "react";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

interface AnimatedVideoRowProps {
  videos: VideoItemType[];
  direction: "left" | "right" | "vertical-down";
  duration: number;
  rowIdx: number;
  rowOffset?: number;
}

// Dramatically bump up the size for high visual impact (remains responsive)
const THUMB_WIDTH = 460;  // px, much bigger for a bold look
const THUMB_HEIGHT = 259; // px, 16:9 ratio for 460 width

export const AnimatedVideoRow = ({
  videos,
  direction,
  duration,
  rowIdx,
  rowOffset = 0
}: AnimatedVideoRowProps) => {
  const doubledVideos = useMemo(() => [...videos, ...videos], [videos]);
  const animationName = `scroll-${direction}-row-${rowIdx}`;

  useEffect(() => {
    if (!document.getElementById(animationName)) {
      const style = document.createElement("style");
      style.id = animationName;
      let keyframes = "";
      if (direction === "left") {
        keyframes = `
          @keyframes ${animationName} {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `;
      } else if (direction === "vertical-down") {
        keyframes = `
          @keyframes ${animationName} {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(0); }
          }
        `;
      }
      style.innerHTML = keyframes;
      document.head.appendChild(style);
    }
  }, [animationName, direction]);

  if (direction === "left") {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{ height: `${THUMB_HEIGHT + 14}px` }}
      >
        <div
          className="flex gap-9 absolute left-0 top-0 w-full"
          style={{
            width: "200%",
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${-rowIdx * (duration / 4)}s`,
            flexDirection: "row",
            marginLeft: `${rowOffset}px`
          }}
        >
          {doubledVideos.map((video, idx) => (
            <div
              key={video.id + "-" + idx}
              className="flex-shrink-0 bg-white/95 border border-white/60 shadow aspect-[16/9]"
              style={{
                width: `${THUMB_WIDTH}px`,
                height: `${THUMB_HEIGHT}px`,
                borderRadius: "11px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: "0",
                padding: 0 // tight to the thumbnail
              }}
            >
              {/* VideoGridItem will fill exactly */}
              <VideoGridItem video={video} noRadius />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (direction === "vertical-down") {
    const stackedVideos = [...videos, ...videos];
    return (
      <div
        className="relative w-full overflow-hidden flex flex-row justify-center"
        style={{ height: `${THUMB_HEIGHT * 2.04 + 30}px` }}
      >
        <div
          className="flex flex-col gap-9 absolute left-0 top-0 w-full items-center"
          style={{
            height: "200%",
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${-rowIdx * (duration / 4)}s`,
            flexDirection: "column",
            marginTop: `${rowOffset}px`
          }}
        >
          {stackedVideos.map((video, idx) => (
            <div
              key={video.id + "-vert-" + idx}
              className="flex-shrink-0 bg-white/95 border border-white/60 shadow aspect-[16/9]"
              style={{
                width: `${THUMB_WIDTH}px`,
                height: `${THUMB_HEIGHT}px`,
                borderRadius: "11px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: "0",
                padding: 0 // tight
              }}
            >
              <VideoGridItem video={video} noRadius />
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

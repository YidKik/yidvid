
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

// Enormous thumbnail size for immersive background effect (responsive!)
const THUMB_WIDTH = 960;   // px, HUGE for almost full screen, adjusts for viewport
const THUMB_HEIGHT = 540;  // px, 16:9 ratio

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

  // Card style so the card matches the thumbnail exactly
  const cardStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0",
    padding: 0
  };

  // Responsive wrapper width
  const wrapperStyle = {
    width: "100vw",
    maxWidth: "100vw",
    minWidth: "100vw"
  };

  // The row container style (makes sure it won't overflow screen horizontally)
  // For mobile: scale down dramatically!
  const getRowHeight = () =>
    `clamp(180px, ${THUMB_HEIGHT}px, 60vw)`; // Scales on mobile, big on desktop

  // For left/right animation
  if (direction === "left") {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{ ...wrapperStyle, height: getRowHeight() }}
      >
        <div
          className="flex gap-4 absolute left-0 top-0 w-full"
          style={{
            width: "200%",
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${-rowIdx * (duration / 4)}s`,
            flexDirection: "row",
            marginLeft: `${rowOffset}px`,
            alignItems: "center"
          }}
        >
          {doubledVideos.map((video, idx) => (
            <div
              key={video.id + "-" + idx}
              className="flex-shrink-0 bg-white/90 border border-white/60 shadow aspect-[16/9]"
              style={{
                width: "clamp(280px, 88vw, 960px)",
                height: "clamp(158px, 49vw, 540px)",
                ...cardStyle
              }}
            >
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
        style={{ ...wrapperStyle, height: `calc(${getRowHeight()} * 2.1)` }}
      >
        <div
          className="flex flex-col gap-6 absolute left-0 top-0 w-full items-center"
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
              className="flex-shrink-0 bg-white/90 border border-white/60 shadow aspect-[16/9]"
              style={{
                width: "clamp(280px, 88vw, 960px)",
                height: "clamp(158px, 49vw, 540px)",
                ...cardStyle
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

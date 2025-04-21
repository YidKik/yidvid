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

// Enormous thumbnail size for truly immersive background effect
const THUMB_WIDTH = 1200;   // px, HUGE for almost full screen, adjusts for viewport
const THUMB_HEIGHT = 675;  // px, 16:9 ratio

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
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0",
    padding: 0
  };

  // Responsive wrapper width - make sure it fills screen
  const wrapperStyle = {
    width: "100vw",
    maxWidth: "100vw",
    minWidth: "100vw",
    overflow: "hidden"
  };

  // Better responsive sizing for truly immersive experience
  // For mobile: scale down but still keep impressive size
  const getItemWidth = () => "clamp(320px, 95vw, 1200px)"; 
  const getItemHeight = () => "clamp(180px, 54vw, 675px)";
  
  // Row height needs to be large enough to contain the items
  const getRowHeight = () => `clamp(200px, 60vw, 700px)`;

  // For left/right animation
  if (direction === "left") {
    return (
      <div
        className="relative overflow-hidden w-full"
        style={{ ...wrapperStyle, height: getRowHeight() }}
      >
        <div
          className="flex gap-6 absolute left-0 top-0"
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
              className="flex-shrink-0 bg-white/80 border border-white/60 shadow-lg"
              style={{
                width: getItemWidth(),
                height: getItemHeight(),
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
        className="relative overflow-hidden flex flex-row justify-center w-full"
        style={{ ...wrapperStyle, height: `calc(${getRowHeight()} * 2.2)` }}
      >
        <div
          className="flex flex-col gap-8 absolute left-0 top-0 w-full items-center"
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
              className="flex-shrink-0 bg-white/80 border border-white/60 shadow-lg"
              style={{
                width: getItemWidth(),
                height: getItemHeight(),
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

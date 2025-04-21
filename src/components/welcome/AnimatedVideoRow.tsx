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

// MASSIVELY increased thumbnail size (3x larger than before)
const THUMB_WIDTH = 27000;   // px, DRAMATICALLY INCREASED to ensure complete screen coverage
const THUMB_HEIGHT = 16800;   // px, DRAMATICALLY INCREASED for ultra-widescreen effect

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

  // Card style so the card matches the thumbnail exactly - removed any constraining styles
  const cardStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0",
    padding: 0,
    minWidth: THUMB_WIDTH / 10 + "px", // Ensure minimum size is respected
    minHeight: THUMB_HEIGHT / 10 + "px" // Ensure minimum size is respected
  };

  // Ultra wide wrapper - ensuring it completely fills the screen with no constraints
  const wrapperStyle = {
    width: "100vw",
    maxWidth: "none", // Remove any maximum width constraints
    minWidth: "100vw",
    overflow: "visible" // Allow content to overflow to avoid clipping
  };

  // Massively increased responsive sizing for completely immersive experience (3x larger)
  // For mobile: still keeps enormous size
  const getItemWidth = () => "clamp(5400px, 900vw, 27000px)"; 
  const getItemHeight = () => "clamp(3200px, 900vh, 16800px)";
  
  // Row height needs to be ultra-large to contain the huge items
  const getRowHeight = () => `clamp(3600px, 1080vh, 18000px)`;

  // For left/right animation
  if (direction === "left") {
    return (
      <div
        className="relative overflow-visible w-full"
        style={{ ...wrapperStyle, height: getRowHeight() }}
      >
        <div
          className="flex gap-4 absolute left-0 top-0"
          style={{
            width: "400%", // Wider container to ensure more content is visible
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${-rowIdx * (duration / 4)}s`,
            flexDirection: "row",
            marginLeft: `${rowOffset}px`,
            alignItems: "center",
            transform: "scale(1.5)" // Extra scaling for additional size
          }}
        >
          {doubledVideos.map((video, idx) => (
            <div
              key={video.id + "-" + idx}
              className="flex-shrink-0 bg-white/20 border border-white/30 shadow-2xl"
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
        className="relative overflow-visible flex flex-row justify-center w-full"
        style={{ ...wrapperStyle, height: `calc(${getRowHeight()} * 2.5)` }}
      >
        <div
          className="flex flex-col gap-6 absolute left-0 top-0 w-full items-center"
          style={{
            height: "400%", // Taller container for more content visibility
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${-rowIdx * (duration / 4)}s`,
            flexDirection: "column",
            marginTop: `${rowOffset}px`,
            transform: "scale(1.5)" // Extra scaling for additional size
          }}
        >
          {stackedVideos.map((video, idx) => (
            <div
              key={video.id + "-vert-" + idx}
              className="flex-shrink-0 bg-white/20 border border-white/30 shadow-2xl"
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

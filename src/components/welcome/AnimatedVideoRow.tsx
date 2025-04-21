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
const THUMB_WIDTH = 13500;   // px, ENORMOUSLY INCREASED to ensure complete screen coverage
const THUMB_HEIGHT = 8400;   // px, ENORMOUSLY INCREASED for ultra-widescreen effect

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
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0",
    padding: 0
  };

  // Ultra wide wrapper - ensuring it completely fills the screen
  const wrapperStyle = {
    width: "100vw",
    maxWidth: "100vw",
    minWidth: "100vw",
    overflow: "hidden"
  };

  // Massively increased responsive sizing for completely immersive experience (3x larger)
  // For mobile: still keeps enormous size
  const getItemWidth = () => "clamp(3600px, 450vw, 13500px)"; 
  const getItemHeight = () => "clamp(2100px, 450vh, 8400px)";
  
  // Row height needs to be ultra-large to contain the huge items
  const getRowHeight = () => `clamp(2400px, 540vh, 9000px)`;

  // For left/right animation
  if (direction === "left") {
    return (
      <div
        className="relative overflow-hidden w-full"
        style={{ ...wrapperStyle, height: getRowHeight() }}
      >
        <div
          className="flex gap-4 absolute left-0 top-0"
          style={{
            width: "250%",
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
        className="relative overflow-hidden flex flex-row justify-center w-full"
        style={{ ...wrapperStyle, height: `calc(${getRowHeight()} * 2.5)` }}
      >
        <div
          className="flex flex-col gap-6 absolute left-0 top-0 w-full items-center"
          style={{
            height: "250%",
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${-rowIdx * (duration / 4)}s`,
            flexDirection: "column",
            marginTop: `${rowOffset}px`
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

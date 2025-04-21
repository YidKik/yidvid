import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useEffect, useRef, useState } from "react";

/**
 * Single video thumbnail for grid (original size)
 */
function VideoGridThumb({
  thumbnail,
  className = "",
  style = {},
}: {
  thumbnail: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-md bg-white aspect-[16/11] w-56 md:w-72 lg:w-[18rem] shadow-none ${className}`}
      style={{
        overflow: "hidden",
        background: "#fff",
        ...style,
      }}
    >
      <img
        src={thumbnail}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
        loading="lazy"
      />
    </div>
  );
}

const GRID_ROWS = 4;
const GRID_COLS = 5;
const SLIDE_DURATION = 25000; // 25 seconds for a very slow, smooth animation
const SLIDE_HEIGHT_REM = 9.5; // approximately matches w-56 aspect-[16/11]

/**
 * CarouselColumn: Vertically and smoothly sliding video thumbs, cycling continuously.
 */
function CarouselColumn({
  videoList,
  rowCount = GRID_ROWS,
}: {
  videoList: Array<{id: string; thumbnail: string}>,
  rowCount?: number;
}) {
  const listLen = videoList.length;
  
  // To ensure a completely smooth continuous animation, we'll duplicate the list 
  // and use CSS animation to create an infinite loop
  const duplicatedList = [...videoList, ...videoList];
  
  // Calculate animation duration based on number of items
  const animationDuration = `${SLIDE_DURATION / 1000}s`;
  const animationName = `slideUpInfinite-${listLen}`;
  
  // Create a dynamic keyframe animation
  const keyframes = `
    @keyframes ${animationName} {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-${listLen * (SLIDE_HEIGHT_REM + 2)}rem);
      }
    }
  `;

  return (
    <div className="relative flex flex-col h-full min-h-[41rem] justify-center w-fit overflow-hidden">
      <style>{keyframes}</style>
      <div 
        className="flex flex-col gap-8"
        style={{
          animation: `${animationName} ${animationDuration} linear infinite`,
          willChange: "transform",
        }}
      >
        {duplicatedList.map((v, i) => (
          <VideoGridThumb
            key={`car-c-${v.id}-${i}`}
            thumbnail={v.thumbnail}
            className=""
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Video grid with animated 1st column (vertical carousel)
 */
export function AnimatedVideoGridRows({ staticRows = false }: { staticRows?: boolean }) {
  // Grab enough videos, default fallback if missing
  const { videos } = useVideoGridData(GRID_ROWS * GRID_COLS);
  const fallbackThumbs = Array(GRID_COLS * GRID_ROWS)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  // If not enough: always fill up with placeholders
  const fullVideos = [
    ...videos,
    ...(videos.length < GRID_ROWS * GRID_COLS
      ? Array(GRID_ROWS * GRID_COLS - videos.length)
          .fill(0)
          .map((_, i) => ({
            id: "extra" + i,
            thumbnail: "/placeholder.svg",
          }))
      : []),
  ];

  // Derive grid: each "row" is GRID_COLS, but first col in each row becomes the top to bottom carousel
  const rowDatas: Array<Array<{ id: string; thumbnail: string }>> = [];
  for (let i = 0; i < GRID_ROWS; i++) {
    const start = i * GRID_COLS;
    rowDatas.push(fullVideos.slice(start, start + GRID_COLS));
  }

  // For 1st column carousel: select 1st video from each row and build a cycling list
  const carouselColVideos = rowDatas.map((row) => row[0]);

  // The rest (static, non-carousel columns): columns 2-5, per row
  const staticCols = rowDatas.map((row) => row.slice(1, GRID_COLS)); // [row][col]

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{
        zIndex: 1,
      }}
    >
      <div className="flex flex-row gap-8">
        {/* Animated vertical carousel as the first column */}
        <CarouselColumn videoList={carouselColVideos} rowCount={GRID_ROWS} />
        {/* Rest of the grid - 4 rows, each 4 (not carousel) */}
        <div className="flex flex-col gap-8">
          {staticCols.map((row, rowIdx) => (
            <div
              key={rowIdx + 1}
              className="flex flex-row gap-8 justify-center"
            >
              {row.map((v, colIdx) => (
                <VideoGridThumb
                  key={v.id + "-" + colIdx}
                  thumbnail={v.thumbnail}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

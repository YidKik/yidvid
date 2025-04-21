import React from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { VideoCarouselRow } from "./VideoCarouselRow";

const ROW_COUNT = 4;
const SLIDE_SECONDS = [900, 720, 800, 600];
// Further reduce vertical offsets for closer rows
const ROW_VERTICAL_OFFSETS = [0, 1, 2, 3];
// Number of videos per row for the carousel (ensure at least as many as visible)
const VIDEOS_PER_ROW = 10;

export function VideoCarouselRows() {
  const { videos, loading } = useVideoGridData(ROW_COUNT * VIDEOS_PER_ROW);

  // Placeholder data for loading state
  const placeholder = (i: number) => ({
    id: `placeholder-${i}`,
    thumbnail: "/placeholder.svg",
    title: "Loading...",
    video_id: "-"
  });

  // Make enough placeholder videos for all rows
  const effectiveVideos = videos.length
    ? videos
    : Array(ROW_COUNT * VIDEOS_PER_ROW).fill(0).map((_, i) => placeholder(i));

  // Split videos into different chunks per row (minimal overlap)
  const getVideosForRow = (ri: number) => {
    // For real videos
    if (effectiveVideos === videos && videos.length > 0) {
      const start = ri * VIDEOS_PER_ROW;
      return videos.slice(start, start + VIDEOS_PER_ROW).length === VIDEOS_PER_ROW
        ? videos.slice(start, start + VIDEOS_PER_ROW)
        : videos.slice(0, VIDEOS_PER_ROW); // fallback to beginning if not enough
    }
    // For placeholders
    return effectiveVideos.slice(ri * VIDEOS_PER_ROW, (ri + 1) * VIDEOS_PER_ROW);
  };

  // Directions alternate between right-to-left and left-to-right
  const directions: Array<"rightToLeft" | "leftToRight"> = ["rightToLeft", "leftToRight", "rightToLeft", "leftToRight"];

  return (
    <div
      className="fixed left-0 right-0 z-10 pointer-events-auto select-none"
      style={{
        top: -50,
        width: "100vw",
        height: "min(99vh,820px)",
      }}
    >
      <div className="w-[99vw] max-w-none mx-0 flex flex-col gap-px justify-center">
        {Array.from({ length: ROW_COUNT }).map((_, ri) => (
          <VideoCarouselRow
            key={`carousel-row-${ri}`}
            rowIndex={ri}
            videos={getVideosForRow(ri)}
            direction={directions[ri]}
            animationDuration={SLIDE_SECONDS[ri % SLIDE_SECONDS.length]}
            verticalOffset={ROW_VERTICAL_OFFSETS[ri] ?? 0}
            placeholder={!videos.length}
          />
        ))}
      </div>
    </div>
  );
}

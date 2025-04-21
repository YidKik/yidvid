
import React from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { VideoCarouselRow } from "./VideoCarouselRow";

const ROW_COUNT = 4;
const SLIDE_SECONDS = [900, 720, 800, 600];
// Further reduce vertical offsets for closer rows
const ROW_VERTICAL_OFFSETS = [0, 1, 2, 3];

export function VideoCarouselRows() {
  const { videos, loading } = useVideoGridData(40);

  // Placeholder data for loading state
  const placeholder = (i: number) => ({
    id: `placeholder-${i}`,
    thumbnail: "/placeholder.svg",
    title: "Loading...",
    video_id: "-"
  });
  const effectiveVideos = videos.length
    ? videos
    : Array(16).fill(0).map((_, i) => placeholder(i)); // Only needed to prevent animation breaking

  // Define directions as an array of the specific literal types
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
      {/* Add a small gap between rows, e.g. 1 (0.25rem) */}
      <div className="w-[99vw] max-w-none mx-0 flex flex-col gap-1 justify-center">
        {Array.from({ length: ROW_COUNT }).map((_, ri) => (
          <VideoCarouselRow
            key={`carousel-row-${ri}`}
            rowIndex={ri}
            videos={effectiveVideos}
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

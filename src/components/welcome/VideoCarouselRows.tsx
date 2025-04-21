
import React, { useEffect } from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { VideoCarouselRow } from "./VideoCarouselRow";

const ROW_COUNT = 4;
const VIDEOS_PER_ROW = 4;
const SLIDE_SECONDS = [900, 720, 800, 600];
const ROW_VERTICAL_OFFSETS = [0, 4, 8, 12];

// Helper to get a unique slice for normal rows or all videos for scrolling
function getRowVideosWithOffset(allVideos, rowIdx, perRow, useFullList = false) {
  const total = allVideos.length;
  if (useFullList) return allVideos;
  const start = rowIdx * perRow;
  return Array.from({ length: perRow }).map((_, i) => allVideos[(start + i) % total]);
}

export function VideoCarouselRows() {
  const { videos, loading } = useVideoGridData(40);

  const placeholder = (i: number) => ({
    id: `placeholder-${i}`,
    thumbnail: "/placeholder.svg",
    title: "Loading...",
    video_id: "-"
  });

  // Fill placeholder videos if loading/no data
  const effectiveVideos = videos.length ? videos : Array(ROW_COUNT * VIDEOS_PER_ROW).fill(0).map((_, i) => placeholder(i));

  // For 2nd and 4th rows, use the full video list, for others just a segment
  const getVideosForRow = (rowIdx: number) => {
    const useFullList = rowIdx === 1 || rowIdx === 3;
    return getRowVideosWithOffset(effectiveVideos, rowIdx, VIDEOS_PER_ROW, useFullList);
  };

  return (
    <div
      className="fixed left-0 right-0 z-10 pointer-events-auto select-none"
      style={{
        top: -50,
        width: "100vw",
        height: "min(99vh,820px)",
        // Note: removed scroll rotation for simpler demo (consider restoring if desired)
      }}
    >
      <div className="w-[99vw] max-w-none mx-0 flex flex-col gap-1 justify-center">
        {[0, 1, 2, 3].map((ri) => (
          <VideoCarouselRow
            key={`carousel-row-${ri}`}
            rowIndex={ri}
            videos={getVideosForRow(ri)}
            direction={ri === 1 || ri === 3 ? "leftToRight" : "rightToLeft"}
            animationDuration={SLIDE_SECONDS[ri % SLIDE_SECONDS.length]}
            verticalOffset={ROW_VERTICAL_OFFSETS[ri] ?? 0}
            placeholder={!videos.length}
          />
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { AnimatedVideoRow } from "./AnimatedVideoRow";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

interface AnimatedVideoRowsShowcaseProps {
  videos: VideoItemType[];
  loading: boolean;
}

export const AnimatedVideoRowsShowcase = ({
  videos,
  loading,
}: AnimatedVideoRowsShowcaseProps) => {
  const numRows = 4;
  const minVideos = numRows * 6;

  const allVideos =
    videos.length < minVideos
      ? [
          ...videos,
          ...Array(minVideos - videos.length)
            .fill(0)
            .map((_, i) => videos[i % videos.length]),
        ]
      : videos;

  const videosPerRow = Math.ceil(allVideos.length / numRows);

  const rowSlices: VideoItemType[][] = [];
  for (let row = 0; row < numRows; row++) {
    const start = row * Math.floor(videosPerRow / 2);
    const slice = [];
    for (let i = 0; i < videosPerRow; i++) {
      slice.push(allVideos[(start + i) % allVideos.length]);
    }
    rowSlices.push(slice);
  }

  // Durations per row, keeping them slightly different for visual interest
  const animationDuration = 32;
  const durations = [
    animationDuration,
    animationDuration - 4,
    animationDuration - 2,
    animationDuration - 6,
  ];

  // Make rows 1 and 3 slide left, rows 2 and 4 slide vertically down
  const directions: ("left" | "vertical-down")[] = [
    "left",
    "vertical-down",
    "left",
    "vertical-down",
  ];

  return (
    <div className="flex flex-col gap-6">
      {rowSlices.map((videosForRow, i) => (
        <AnimatedVideoRow
          key={i}
          videos={videosForRow}
          direction={directions[i]}
          duration={durations[i]}
          rowIdx={i}
        />
      ))}
    </div>
  );
};

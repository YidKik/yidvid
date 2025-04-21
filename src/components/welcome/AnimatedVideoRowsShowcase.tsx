
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
  // Reduce number of rows to make each video row more prominent
  const numRows = 2;
  const minVideos = numRows * 4;

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

  // Slower animation for more massive, dramatic effect
  const animationDuration = 60;
  const durations = [
    animationDuration,
    animationDuration - 10,
  ];

  // Simply alternate directions for maximum visual impact
  const directions: ("left" | "vertical-down")[] = [
    "left",
    "left",
  ];

  // Minimal row offsets since videos are so large now
  const rowOffsets = [0, 120];

  return (
    <div className="flex flex-col gap-4">
      {rowSlices.map((videosForRow, i) => (
        <AnimatedVideoRow
          key={i}
          videos={videosForRow}
          direction={directions[i]}
          duration={durations[i]}
          rowIdx={i}
          rowOffset={rowOffsets[i] ?? 0}
        />
      ))}
    </div>
  );
};

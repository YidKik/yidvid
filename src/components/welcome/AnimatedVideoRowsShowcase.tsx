
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

  // Longer animation duration for more immersive effect
  const animationDuration = 36;
  const durations = [
    animationDuration,
    animationDuration - 5,
    animationDuration - 3,
    animationDuration - 7,
  ];

  const directions: ("left" | "vertical-down")[] = [
    "left",
    "vertical-down",
    "left",
    "vertical-down",
  ];

  // More dramatic offsets for better visual contrast
  const rowOffsets = [0, 120, 180, 100];

  return (
    <div className="flex flex-col gap-2">
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

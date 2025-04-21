
import React, { useRef, useEffect, useState } from "react";
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
  // Use more rows to completely fill the background
  const numRows = 4;
  const minVideos = numRows * 3;

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

  // EXTREMELY slow animation speed for truly massive dramatic effect
  const animationDuration = 120; // Even slower for more dramatic effect
  const durations = [
    animationDuration,
    animationDuration - 15,
    animationDuration - 25,
    animationDuration - 10,
  ];

  // More varied directions for a truly immersive background effect
  const directions: ("left" | "vertical-down")[] = [
    "left",
    "left",
    "vertical-down", 
    "left",
  ];

  // Increased offsets for better visual staggering
  const rowOffsets = [0, 200, 0, 300];

  // --- SCROLL ROTATION & SCALE LOGIC ---
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      // Normalize scroll progress (0 = top, 1 = 1000px down or max 1)
      const maxScroll = 500; // You can tune this, higher value = slower effect
      const progress = Math.min(window.scrollY / maxScroll, 1);
      setScrollProgress(progress);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col gap-0 -my-20 transform scale-[1.7] origin-center">
      {rowSlices.map((videosForRow, i) => (
        <AnimatedVideoRow
          key={i}
          videos={videosForRow}
          direction={directions[i]}
          duration={durations[i]}
          rowIdx={i}
          rowOffset={rowOffsets[i] ?? 0}
          scrollProgress={scrollProgress}
        />
      ))}
    </div>
  );
};

import { useEffect, useMemo } from "react";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

/**
 * New AnimatedVideoRow
 */
interface AnimatedVideoRowProps {
  videos: VideoItemType[];
  direction: "left" | "vertical-down";
  duration: number;
  rowIdx: number;
}

// Use standard YouTube thumbnail size as reference
const THUMB_WIDTH = 340;  // px, a little bit wider for a boxier look
const THUMB_HEIGHT = 192; // px, 16:9

const AnimatedVideoRow = ({
  videos,
  direction,
  duration,
  rowIdx
}: AnimatedVideoRowProps) => {
  // Double list for seamless looping
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
            0% { transform: translateY(0); }
            100% { transform: translateY(100%); }
          }
        `;
      }
      style.innerHTML = keyframes;
      document.head.appendChild(style);
    }
  }, [animationName, direction]);

  if (direction === "left") {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{ height: `${THUMB_HEIGHT + 8}px` }} // keep same height for all
      >
        <div
          className="flex gap-6 absolute left-0 top-0 w-full"
          style={{
            width: "200%",
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${-rowIdx * (duration / 4)}s`,
            flexDirection: "row"
          }}
        >
          {doubledVideos.map((video, idx) => (
            <div
              key={video.id + "-" + idx}
              className="flex-shrink-0 bg-white/90 border border-white/60 shadow aspect-[16/9]"
              style={{
                width: `${THUMB_WIDTH}px`,
                height: `${THUMB_HEIGHT}px`,
                borderRadius: "8px", // boxier corners
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: "0"
              }}
            >
              <VideoGridItem video={video} noRadius />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (direction === "vertical-down") {
    // Vertical duplicate for smooth looping
    const stackedVideos = [...videos, ...videos];
    return (
      <div
        className="relative w-full overflow-hidden flex flex-row justify-center"
        style={{ height: `${THUMB_HEIGHT * 2 + 24}px` }}
      >
        <div
          className="flex flex-col gap-6 absolute left-0 top-0 w-full items-center"
          style={{
            height: "200%",
            animation: `${animationName} ${duration}s linear infinite`,
            animationDelay: `${-rowIdx * (duration / 4)}s`,
            flexDirection: "column"
          }}
        >
          {stackedVideos.map((video, idx) => (
            <div
              key={video.id + "-vert-" + idx}
              className="flex-shrink-0 bg-white/90 border border-white/60 shadow aspect-[16/9]"
              style={{
                width: `${THUMB_WIDTH}px`,
                height: `${THUMB_HEIGHT}px`,
                borderRadius: "8px", // boxier corners
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: "0"
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

export const HomeVideoShowcase = () => {
  // Grab enough videos for a continuous showcase
  const { videos, loading } = useVideoGridData(40);
  const numRows = 4;
  const minVideos = numRows * 6;

  if (loading || !videos.length) {
    return (
      <div className="w-full flex flex-col items-center py-8">
        <span className="text-2xl font-bold text-purple-400 mb-4 animate-pulse">
          Loading featured videos...
        </span>
      </div>
    );
  }

  const allVideos =
    videos.length < minVideos
      ? [
          ...videos,
          ...Array(minVideos - videos.length)
            .fill(0)
            .map((_, i) => videos[i % videos.length])
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

  // Durations per row, keep them slightly different for visual interest
  const animationDuration = 32;
  const durations = [animationDuration, animationDuration - 4, animationDuration - 2, animationDuration - 6];

  // 1=left, 2=vertical-down, 3=left, 4=vertical-down (zero-indexed)
  const directions: ("left" | "vertical-down")[] = [
    "left",
    "vertical-down",
    "left",
    "vertical-down"
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-10 md:py-14 bg-gradient-to-br from-[#f6dbf5]/40 to-[#ffe29f]/40 rounded-3xl shadow-lg border border-white/30 backdrop-blur-md">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-primary via-accent to-pink-400 bg-clip-text text-transparent animate-fade-in drop-shadow-lg">
        Latest Videos
      </h2>
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
    </div>
  );
};

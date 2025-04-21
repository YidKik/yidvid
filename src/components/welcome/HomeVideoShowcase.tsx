import { useEffect, useMemo } from "react";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

/**
 * New AnimatedVideoRow
 * - Smoothly scrolls ALL videos, looping, each row offset
 * - Uses seamless horizontal animation without visible jumps
 */
interface AnimatedVideoRowProps {
  videos: VideoItemType[];
  direction: "left" | "right";
  duration: number;
  rowIdx: number;
}

const AnimatedVideoRow = ({
  videos,
  direction,
  duration,
  rowIdx
}: AnimatedVideoRowProps) => {
  // Double list for seamless looping
  const doubledVideos = useMemo(() => [...videos, ...videos], [videos]);

  // For unique animation, generate a different animation key for each row
  const animationName = `scroll-${direction}-row-${rowIdx}`;

  // Keyframes: left means negative X, right means positive X
  useEffect(() => {
    // Only inject once per unique animationName
    if (!document.getElementById(animationName)) {
      const style = document.createElement("style");
      style.id = animationName;
      const totalWidthPct = 100;
      style.innerHTML = `
        @keyframes ${animationName} {
          0% { transform: translateX(0); }
          100% { transform: translateX(${direction === "left" ? "-" : ""}${totalWidthPct}%); }
        }
      `;
      document.head.appendChild(style);
    }
  }, [animationName, direction]);

  return (
    <div className="relative w-full h-36 overflow-hidden">
      <div
        className="flex gap-6 absolute left-0 top-0 w-full"
        style={{
          width: "200%", // Important for looping
          animation: `${animationName} ${duration}s linear infinite`,
          animationDelay: `${-rowIdx * (duration / 4)}s`,
          flexDirection: "row"
        }}
      >
        {doubledVideos.map((video, idx) => (
          <div
            key={video.id + "-" + idx}
            className="w-56 flex-shrink-0"
            style={{
              aspectRatio: "16 / 9",
              transform: `rotate(${((idx + rowIdx) % 2 === 0 ? 1 : -1) * ((rowIdx + 1) * 2 - 3)}deg) scale(0.96)`,
            }}
          >
            <VideoGridItem video={video} />
          </div>
        ))}
      </div>
    </div>
  );
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

  // If not enough videos, repeat them to fill
  const allVideos =
    videos.length < minVideos
      ? [
          ...videos,
          ...Array(minVideos - videos.length)
            .fill(0)
            .map((_, i) => videos[i % videos.length])
        ]
      : videos;

  // For each row, offset starting index to show different slice (and prevent identical rows)
  const videosPerRow = Math.ceil(allVideos.length / numRows);

  const rowSlices: VideoItemType[][] = [];
  for (let row = 0; row < numRows; row++) {
    // Stagger starting index so rows are offset if looping
    const start = row * Math.floor(videosPerRow / 2);
    // Get enough for the double list per row
    const slice = [];
    for (let i = 0; i < videosPerRow; i++) {
      slice.push(allVideos[(start + i) % allVideos.length]);
    }
    rowSlices.push(slice);
  }

  // Decent animation speed for pleasant look
  const animationDuration = 32; // seconds for a full loop, adjust as needed

  return (
    <div className="w-full max-w-7xl mx-auto py-10 md:py-14 bg-gradient-to-br from-[#f6dbf5]/40 to-[#ffe29f]/40 rounded-3xl shadow-lg border border-white/30 backdrop-blur-md">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-primary via-accent to-pink-400 bg-clip-text text-transparent animate-fade-in drop-shadow-lg">
        Latest Videos
      </h2>
      <div className="flex flex-col gap-7">
        {rowSlices.map((videosForRow, i) => (
          <AnimatedVideoRow
            key={i}
            videos={videosForRow}
            direction={i % 2 === 0 ? "left" : "right"}
            duration={animationDuration - i * 2}
            rowIdx={i}
          />
        ))}
      </div>
    </div>
  );
};

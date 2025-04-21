import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { AnimatedVideoRow } from "./AnimatedVideoRow";

/**
 * HomeVideoShowcase
 */
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

  // Make rows 1 and 3 slide left, rows 2 and 4 slide vertically down
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

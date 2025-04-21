
import { useVideoGridData } from "@/hooks/video/useVideoGridData";

/**
 * Single video thumbnail for grid
 */
function VideoGridThumb({
  thumbnail,
}: {
  thumbnail: string;
}) {
  return (
    <div
      className="rounded-lg bg-white aspect-video w-40 md:w-56 lg:w-64" // Less rounded, no border
      style={{
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <img
        src={thumbnail}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}

/**
 * Static, perfectly aligned 4x5 video grid, with gentle grid rotation.
 * All rows and columns are perfectly aligned, with larger thumbnails.
 */
export function AnimatedVideoGridRows({ staticRows = false }: { staticRows?: boolean }) {
  // Grab 20 videos (fallback to placeholder if missing)
  const { videos, loading } = useVideoGridData(20);
  const colPerRow = 5;
  const fallbackThumbs = Array(colPerRow)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  // Split into up to 4 rows
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const start = i * colPerRow;
    const rowVideos =
      videos.length >= start + colPerRow
        ? videos.slice(start, start + colPerRow)
        : fallbackThumbs;
    rows.push(rowVideos);
  }

  // Grid with a subtle rotation (not so crooked)
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{
        zIndex: 1,
      }}
    >
      <div
        className="flex flex-col gap-8"
        style={{
          transform: "rotate(5deg)", // Less rotation for subtle effect
        }}
      >
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-row gap-8 justify-center"
          >
            {row.map((v, colIdx) => (
              <VideoGridThumb
                key={v.id + "-" + colIdx}
                thumbnail={v.thumbnail}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

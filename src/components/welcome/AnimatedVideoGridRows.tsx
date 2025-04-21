
import { useVideoGridData } from "@/hooks/video/useVideoGridData";

/**
 * Single video thumbnail for grid
 */
function VideoGridThumb({
  thumbnail,
  borderColor,
}: {
  thumbnail: string;
  borderColor: string;
}) {
  return (
    <div
      className="rounded-xl bg-white aspect-video w-40 md:w-56 lg:w-64 border-2"
      style={{
        borderColor,
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
 * Static, perfectly aligned 4x5 video grid, with entire grid rotated and alternating border color rows.
 *
 * The entire grid is rotated to the right (positive angle), per user sketch.
 * All rows and columns are perfectly aligned, with larger thumbnails.
 */
export function AnimatedVideoGridRows({ staticRows = false }: { staticRows?: boolean }) {
  // Grab 20 videos (fallback to placeholder if missing)
  const { videos, loading } = useVideoGridData(20);
  const colPerRow = 5;
  const fallbackThumbs = Array(colPerRow)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  // Alternate row borders: red, black, red, black
  const borderColors = ["#ea384c", "#000", "#ea384c", "#000"];

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

  // Render as a background block, rotated as a whole
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
          transform: "rotate(13deg)", // Rotate right as per user sketch
        }}
      >
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-row gap-8 justify-center"
            style={{
              // No extra translation, all rows perfectly aligned
            }}
          >
            {row.map((v, colIdx) => (
              <VideoGridThumb
                key={v.id + "-" + colIdx}
                thumbnail={v.thumbnail}
                borderColor={borderColors[rowIdx % borderColors.length]}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

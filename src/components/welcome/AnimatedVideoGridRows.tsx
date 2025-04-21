
import { useEffect, useRef } from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";

/**
 * Static row of video thumbnails with props for rotation and color.
 */
function StaticRow({
  videos,
  angle,
  borderColor,
  className = "",
}: {
  videos: { id: string; thumbnail: string }[];
  angle: number;
  borderColor: string;
  className?: string;
}) {
  // Only the static version: just show thumbnails in a row with rotation and border
  return (
    <div
      className={`relative flex w-fit ${className}`}
      style={{
        transform: `rotate(${angle}deg)`,
        height: 110,
        alignItems: "center",
      }}
    >
      <div className="flex gap-7 px-2">
        {videos.map((v, i) => (
          <div
            key={v.id + "-" + i}
            className="rounded-xl bg-white aspect-video w-32 lg:w-44 border-2"
            style={{
              borderColor,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <img
              src={v.thumbnail}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated row of video thumbnails with props for scrolling direction, rotation, and color.
 */
function AnimatedRow({
  videos,
  direction,
  angle,
  borderColor,
  speed,
}: {
  videos: { id: string; thumbnail: string }[];
  direction: "up" | "down";
  angle: number;
  borderColor: string;
  speed: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  // Inject keyframes for animation (once)
  useEffect(() => {
    if (!document.getElementById("yidvid-home-row-anim")) {
      const style = document.createElement("style");
      style.id = "yidvid-home-row-anim";
      style.innerHTML = `
        @keyframes yidvid-slide-down {
          0% { transform: translateY(-68px); }
          100% { transform: translateY(68px);}
        }
        @keyframes yidvid-slide-up {
          0% { transform: translateY(68px);}
          100% { transform: translateY(-68px);}
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const rowAnim = direction === "down" ? "yidvid-slide-down" : "yidvid-slide-up";
  const doubled = [...videos, ...videos]; // Loop thumbnails

  return (
    <div
      ref={rowRef}
      className="relative flex w-fit"
      style={{
        transform: `rotate(${angle}deg)`,
        height: 120,
      }}
    >
      <div
        className="flex gap-9 px-6"
        style={{
          animation: `${rowAnim} ${speed}s linear infinite`,
          alignItems: "center",
        }}
      >
        {doubled.map((v, i) => (
          <div
            // Border: only visible, no drop-shadow, red or black
            key={v.id + "-" + i}
            className={`rounded-xl bg-white aspect-video w-44 lg:w-56 border-2`}
            style={{
              borderColor,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <img
              src={v.thumbnail}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnimatedVideoGridRows({ staticRows = false }: { staticRows?: boolean }) {
  // Fetch latest 20 videos.
  const { videos, loading } = useVideoGridData(20);
  const colPerRow = 5;

  // Fallbacks in case no videos.
  const fallbackThumbs = Array(5)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  // Match the sketch: red/black, rotated, no animation
  const rowConfigs = [
    { angle: -7, borderColor: "#ea384c" }, // red (down)
    { angle: 5,  borderColor: "#000" },    // black (up)
    { angle: -4, borderColor: "#ea384c" }, // red (down)
    { angle: 8,  borderColor: "#000" },    // black (up)
  ];

  // For animated version, we need direction and speed too
  const animatedRowConfigs = [
    { direction: "down" as const, angle: -7, borderColor: "#ea384c", speed: 14 }, // red
    { direction: "up" as const,   angle: 5,  borderColor: "#000",    speed: 16 }, // black
    { direction: "down" as const, angle: -4, borderColor: "#ea384c", speed: 12 }, // red
    { direction: "up" as const,   angle: 8,  borderColor: "#000",    speed: 15 }, // black
  ];

  // Split videos into up to 4 rows
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const start = i * colPerRow;
    const rowVideos =
      videos.length >= start + colPerRow
        ? videos.slice(start, start + colPerRow)
        : fallbackThumbs;
    rows.push(rowVideos);
  }

  // If staticRows is true, show static rows (otherwise old behavior)
  if (staticRows) {
    return (
      <div className="w-full relative flex flex-col gap-4 items-center select-none z-5 pointer-events-none pb-1">
        {rows.map((row, idx) => {
          const config = rowConfigs[idx];
          return (
            <div
              key={idx}
              className="w-full flex justify-center"
              style={{
                marginTop: idx === 0 ? 0 : "-32px",
                zIndex: 10 - idx,
              }}
            >
              <StaticRow
                videos={row}
                angle={config.angle}
                borderColor={config.borderColor}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // For animated rows case (legacy, not used on main page now)
  return (
    <div className="w-full relative flex flex-col gap-4 items-center select-none z-5 pb-1 pointer-events-none">
      {rows.map((row, idx) => {
        const config = animatedRowConfigs[idx];
        return (
          <div
            key={idx}
            className="w-full flex justify-center"
            style={{
              marginTop: idx === 0 ? 0 : "-28px",
              zIndex: 10 - idx,
            }}
          >
            <AnimatedRow
              videos={row}
              direction={config.direction}
              angle={config.angle}
              borderColor={config.borderColor}
              speed={config.speed}
            />
          </div>
        );
      })}
    </div>
  );
}

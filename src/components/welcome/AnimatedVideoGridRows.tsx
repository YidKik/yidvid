
import { useEffect, useRef } from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";

// Renders a single animated row of thumbnails
function AnimatedRow({ videos, direction, angle, borderColor, speed }: {
  videos: { id: string; thumbnail: string }[];
  direction: "up" | "down";
  angle: number;            // degrees for rotation
  borderColor: string;      // any tailwind color for demo
  speed: number;            // seconds for one full animation cycle
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  // Animation keyframe logic (inject just once globally)
  useEffect(() => {
    if (!document.getElementById("home-rows-anim")) {
      const style = document.createElement("style");
      style.id = "home-rows-anim";
      style.innerHTML = `
        @keyframes slideRowDown {
          0% { transform: translateY(-60px); }
          100% { transform: translateY(60px);}
        }
        @keyframes slideRowUp {
          0% { transform: translateY(60px);}
          100% { transform: translateY(-60px);}
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const rowAnim = direction === "down" ? "slideRowDown" : "slideRowUp";
  // Loop thumbnails for seamless animation
  const doubled = [...videos, ...videos];

  return (
    <div
      ref={rowRef}
      className="relative flex w-fit"
      style={{
        transform: `rotate(${angle}deg)`,
        height: 120, // set row height, tweak as needed
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
            key={v.id + "-" + i}
            className={`rounded-xl bg-white shadow-lg aspect-video w-44 lg:w-56 border-2`}
            style={{
              borderColor,
              overflow: "hidden"
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

export function AnimatedVideoGridRows() {
  // Fetch 20 latest videos
  const { videos, loading } = useVideoGridData(20);
  const colPerRow = 5;
  // Fallback: empty slots if loading
  const fallbackThumbs = Array(5).fill("/placeholder.svg").map((t,i) => ({id: 'fake-'+i, thumbnail: t}));

  // Helper to assign directions/angles/colors as your sample
  const rowConfigs = [
    { direction: "down", angle: -5, borderColor: "#ea384c", speed: 13 },
    { direction: "up",   angle: 4,  borderColor: "#000",    speed: 15 },
    { direction: "down", angle: -3, borderColor: "#ea384c", speed: 12 },
    { direction: "up",   angle: 6,  borderColor: "#000",    speed: 14 },
  ];
  // Chunk videos, fill with fallback if too few
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const start = i * colPerRow;
    const rowVideos =
      videos.length >= (start + colPerRow)
        ? videos.slice(start, start + colPerRow)
        : fallbackThumbs;
    rows.push(rowVideos);
  }
  // Mobile: scale down
  return (
    <div className="w-full relative flex flex-col gap-4 items-center select-none z-5 pb-1">
      {rows.map((row, idx) => {
        const config = rowConfigs[idx];
        return (
          <div
            key={idx}
            className="w-full flex justify-center"
            style={{ marginTop: idx === 0 ? 0 : "-25px", zIndex: 10 - idx }}
          >
            <AnimatedRow
              videos={row}
              direction={config.direction as "up" | "down"}
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


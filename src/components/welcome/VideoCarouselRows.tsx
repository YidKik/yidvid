
import React, { useEffect, useRef, useState } from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useNavigate } from "react-router-dom";

// Helper to split the videos into rows
const splitRows = (videos: any[], rowCount: number, perRow: number) => {
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push(videos.slice(i * perRow, (i + 1) * perRow));
  }
  // If not enough videos, repeat/fill in
  return rows.map((row, idx) =>
    row.length < perRow
      ? [...row, ...Array(perRow - row.length).fill(null)]
      : row
  );
};

const ROW_COUNT = 4;
const VIDEOS_PER_ROW = 4;
const SLIDE_SECONDS = [15, 16.5, 17.5, 18.5]; // Slightly different speeds per row for effect

const getDirection = (rowIdx: number) => (rowIdx % 2 === 0 ? "left" : "right");

function useScrollRotation() {
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Range: 0px to 220px scroll -> 0deg to 6deg and 1 -> 1.10 scale
  const rotation = Math.min((scroll / 220) * 6, 6);
  const scale = 1 + Math.min((scroll / 220) * 0.10, 0.10);
  return { rotation, scale };
}

export function VideoCarouselRows() {
  const navigate = useNavigate();
  const { videos, loading } = useVideoGridData(ROW_COUNT * VIDEOS_PER_ROW + 8); // Fixed typo here
  const { rotation, scale } = useScrollRotation();

  // Use placeholder thumbs if loading
  const placeholder = (i: number) => ({
    id: `placeholder-${i}`,
    thumbnail: "/placeholder.svg",
    title: "Loading...",
    video_id: "-"
  });

  const rows =
    !videos.length
      ? Array(ROW_COUNT).fill(0).map((_, idx) =>
          Array(VIDEOS_PER_ROW).fill(0).map((_, j) => placeholder(idx * VIDEOS_PER_ROW + j))
        )
      : splitRows(videos, ROW_COUNT, VIDEOS_PER_ROW);

  // Loop thumbnails for seamless infinite scroll
  const doubleRows = rows.map(row => [...row, ...row]);

  return (
    <div
      className="absolute left-1/2 bottom-0 w-[99vw] max-w-[1680px] -translate-x-1/2 pointer-events-auto select-none z-10"
      style={{
        transform: `translateY(7vw) rotate(${rotation}deg) scale(${scale})`,
        transition: "transform 0.35s cubic-bezier(.53,.42,.19,1.04)"
      }}
    >
      <div className="flex flex-col gap-7 w-full">
        {doubleRows.map((rowVideos, ri) => {
          const slideAnim = `
            @keyframes slideRow${ri} {
              0% { transform: translateX(0); }
              100% { transform: translateX(${getDirection(ri)==="left"?'-':''
                }50%); }
            }
          `;
          // Only inject once per row
          useEffect(() => {
            if (!document.getElementById(`carousel-row-anim-${ri}`)) {
              const style = document.createElement('style');
              style.id = `carousel-row-anim-${ri}`;
              style.innerHTML = slideAnim;
              document.head.appendChild(style);
            }
          }, [slideAnim, ri]);

          return (
            <div
              key={`carousel-row-${ri}`}
              className="relative flex overflow-hidden w-full h-44 md:h-56"
              tabIndex={-1}
              aria-roledescription="carousel row"
              style={{
                maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)",
                WebkitMaskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)",
              }}
            >
              <div
                className="flex gap-8 md:gap-11"
                style={{
                  width: `calc(${rowVideos.length * 24}vw)`,
                  animation: `slideRow${ri} ${SLIDE_SECONDS[ri % SLIDE_SECONDS.length]}s linear infinite`,
                  flexDirection: getDirection(ri) === "left" ? "row" : "row-reverse",
                  alignItems: "center",
                }}
              >
                {rowVideos.map((video, vi) =>
                  video ? (
                    <button
                      key={video.id + "-" + vi}
                      className="aspect-video rounded-xl shadow-lg ring-2 ring-primary/20 overflow-hidden bg-white/80 hover:scale-110 transition-transform duration-300 flex-none w-44 md:w-60 cursor-pointer group"
                      onClick={() =>
                        video.video_id && video.video_id !== "-"
                          ? navigate(`/video/${video.video_id}`)
                          : undefined
                      }
                      aria-label={video.title}
                      tabIndex={0}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:brightness-110"
                        draggable={false}
                      />
                    </button>
                  ) : (
                    <div key={`empty-${vi}`} className="aspect-video rounded-lg bg-gray-200 w-44 md:w-60 animate-pulse" aria-hidden="true" />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


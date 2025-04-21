
import React, { useEffect, useRef, useState } from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useNavigate } from "react-router-dom";

const ROW_COUNT = 4;
const VIDEOS_PER_ROW = 4;
const MAX_FETCH = 40; // Get more videos for more variety
const SLIDE_SECONDS = [15, 16.5, 17.5, 18.5];

const getDirection = (rowIdx: number) => (rowIdx % 2 === 0 ? "left" : "right");

// When list is short, loop & fill
function getRowVideosWithOffset(allVideos, rowIdx, perRow, allRows) {
  const total = allVideos.length;
  const start = rowIdx * perRow;
  // For static start: unique, non-overlapping segment for each row
  const base = [];
  for (let i = 0; i < perRow; i++) {
    base.push(allVideos[(start + i) % total]);
  }

  // For sliding: build an offset loop for each row
  // Slides start at different positions
  const slide = [];
  const offset = Math.floor((total / allRows) * rowIdx); // Offset per-row
  for (let i = 0; i < total; i++) {
    slide.push(allVideos[(offset + i) % total]);
  }
  // Return [startSegment, fullRowLoop]
  return [base, slide];
}

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
  // Attempt to grab up to 40, fallback to however many exist
  const { videos, loading } = useVideoGridData(MAX_FETCH);
  const { rotation, scale } = useScrollRotation();

  // Placeholder for loading state
  const placeholder = (i: number) => ({
    id: `placeholder-${i}`,
    thumbnail: "/placeholder.svg",
    title: "Loading...",
    video_id: "-"
  });

  // Compose the data for each row
  let rowBases = [];
  let rowSlides = [];
  if (!videos.length) {
    // Still loading: fill with placeholders (same as before)
    rowBases = Array(ROW_COUNT).fill(0).map((_, idx) =>
      Array(VIDEOS_PER_ROW).fill(0).map((_, j) => placeholder(idx * VIDEOS_PER_ROW + j))
    );
    rowSlides = rowBases.map(row => [...row, ...row]); // just static for loading
  } else {
    // Real videos!
    for (let r = 0; r < ROW_COUNT; r++) {
      const [startSegment, rowLoop] = getRowVideosWithOffset(videos, r, VIDEOS_PER_ROW, ROW_COUNT);
      // Each row's slide track is the full unique order (looped)
      // For infinite scroll, we'll double it to allow seamless animation
      rowBases.push(startSegment);
      rowSlides.push([...rowLoop, ...rowLoop]);
    }
  }

  return (
    <div
      className="absolute left-1/2 bottom-0 w-[99vw] max-w-[1680px] -translate-x-1/2 pointer-events-auto select-none z-10"
      style={{
        // Place in the horizontal center and animate rotation/scale on scroll
        transform: `translateY(7vw) rotate(${rotation}deg) scale(${scale})`,
        transition: "transform 0.35s cubic-bezier(.53,.42,.19,1.04)"
      }}
    >
      <div className="flex flex-col gap-7 w-full">
        {rowSlides.map((rowVideos, ri) => {
          const slideAnim = `
            @keyframes slideRow${ri} {
              0% { transform: translateX(0); }
              100% { transform: translateX(${getDirection(ri)==="left" ? '-' : ''}50%); }
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

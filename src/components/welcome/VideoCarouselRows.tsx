import React, { useEffect, useState } from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useNavigate } from "react-router-dom";

const ROW_COUNT = 4;
const VIDEOS_PER_ROW = 4;
const MAX_FETCH = 40; // Get more videos for more variety
const SLIDE_SECONDS = [200, 200, 200, 200]; // Much slower for all rows

const getDirection = (rowIdx: number) => (rowIdx % 2 === 0 ? "left" : "right");

function getRowVideosWithOffset(allVideos, rowIdx, perRow, allRows) {
  const total = allVideos.length;
  const start = rowIdx * perRow;
  const base = [];
  for (let i = 0; i < perRow; i++) {
    base.push(allVideos[(start + i) % total]);
  }
  const slide = [];
  const offset = Math.floor((total / allRows) * rowIdx);
  for (let i = 0; i < total; i++) {
    slide.push(allVideos[(offset + i) % total]);
  }
  return [base, slide];
}

function useScrollRotation() {
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const rotation = Math.min((scroll / 220) * 6, 6);
  const scale = 1 + Math.min((scroll / 220) * 0.10, 0.10);
  return { rotation, scale };
}

export function VideoCarouselRows() {
  const navigate = useNavigate();
  const { videos, loading } = useVideoGridData(MAX_FETCH);
  const { rotation, scale } = useScrollRotation();

  const placeholder = (i: number) => ({
    id: `placeholder-${i}`,
    thumbnail: "/placeholder.svg",
    title: "Loading...",
    video_id: "-"
  });

  let rowBases = [];
  let rowSlides = [];
  if (!videos.length) {
    rowBases = Array(ROW_COUNT).fill(0).map((_, idx) =>
      Array(VIDEOS_PER_ROW).fill(0).map((_, j) => placeholder(idx * VIDEOS_PER_ROW + j))
    );
    // Always triple the placeholder row to ensure full coverage in all directions
    rowSlides = rowBases.map(row => [...row, ...row, ...row]);
  } else {
    for (let r = 0; r < ROW_COUNT; r++) {
      const [startSegment, rowLoop] = getRowVideosWithOffset(videos, r, VIDEOS_PER_ROW, ROW_COUNT);
      rowBases.push(startSegment);
      // Triple the video loop for every row to ensure continuous coverage in all directions
      rowSlides.push([...rowLoop, ...rowLoop, ...rowLoop]);
    }
  }

  return (
    <div
      className="fixed left-0 right-0 z-10 pointer-events-auto select-none flex justify-center items-center"
      style={{
        top: "50%",
        left: "50%",
        right: "unset",
        bottom: "unset",
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        transition: "transform 0.35s cubic-bezier(.53,.42,.19,1.04)",
        width: "100vw",
        height: "auto"
      }}
    >
      <div className="w-full max-w-[1680px] mx-auto flex flex-col gap-7">
        {rowSlides.map((rowVideos, ri) => {
          const direction = getDirection(ri);
          const slideAnim = `
            @keyframes slideRow${ri} {
              0% { transform: translateX(${direction === "left" ? '0' : '-50%'}); }
              100% { transform: translateX(${direction === "left" ? '-50%' : '0'}); }
            }
          `;
          
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
            >
              <div
                className="flex gap-8 md:gap-11"
                style={{
                  width: `calc(${rowVideos.length * 24}vw)`,
                  animation: `slideRow${ri} ${SLIDE_SECONDS[ri % SLIDE_SECONDS.length]}s cubic-bezier(0.33,1,0.68,1) infinite`,
                  flexDirection: "row",
                  alignItems: "center",
                  transform: direction === "right" ? "translateX(-50%)" : "translateX(0)",
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

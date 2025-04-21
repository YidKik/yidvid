
import React, { useEffect, useState, useRef } from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useNavigate } from "react-router-dom";

const ROW_COUNT = 4;
const VIDEOS_PER_ROW = 4;
const MAX_FETCH = 40;
// MUCH SLOWER and SMOOTHER slide durations (seconds)
const SLIDE_SECONDS = [900, 720, 800, 600];
// Vertical spacing offsets for brick pattern (pixels)
const ROW_VERTICAL_OFFSETS = [0, 4, 8, 12];

function getRowVideosWithOffset(allVideos, rowIdx, perRow, allRows) {
  const total = allVideos.length;
  const start = rowIdx * perRow;
  const base = [];
  for (let i = 0; i < perRow; i++) {
    base.push(allVideos[(start + i) % total]);
  }
  const slide = [];
  // For variety: stagger the start for each row
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
  // Start with a default rotation of 4deg and scale 1.09, increase with scroll (stronger effect)
  const rotation = 4 + Math.min((scroll / 140) * 10, 10); // up to ~14deg total
  const scale = 1.09 + Math.min((scroll / 160) * 0.18, 0.18); // up to 1.27x scale
  return { rotation, scale };
}

export function VideoCarouselRows() {
  const navigate = useNavigate();
  const { videos, loading } = useVideoGridData(MAX_FETCH);
  const { rotation, scale } = useScrollRotation();
  const carouselRef = useRef<HTMLDivElement>(null);

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
    rowSlides = rowBases.map(row => [...row, ...row, ...row]);
  } else {
    for (let r = 0; r < ROW_COUNT; r++) {
      const [startSegment, rowLoop] = getRowVideosWithOffset(videos, r, VIDEOS_PER_ROW, ROW_COUNT);
      rowBases.push(startSegment);
      rowSlides.push([...rowLoop, ...rowLoop]);
    }
  }

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'carousel-animations';
    
    let animations = '';
    
    for (let i = 0; i < ROW_COUNT; i++) {
      animations += `
        @keyframes slideRow${i} {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `;
    }
    
    styleElement.innerHTML = animations;
    document.head.appendChild(styleElement);
    
    return () => {
      const existingStyle = document.getElementById('carousel-animations');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Define pixel width of a video card for offset calculation
  // w-44 = 176px (default), md:w-60 = 240px (desktop)
  // Use half for the "brick" effect
  const getCardOffset = () => ({
    base: 88,    // half of 176
    md: 120      // half of 240
  });

  return (
    <div
      ref={carouselRef}
      className="fixed left-0 right-0 z-10 pointer-events-auto select-none"
      style={{
        top: -50,
        width: "100vw",
        height: "min(99vh,820px)",
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "100% 0%",
        transition: "transform 0.5s cubic-bezier(.53,.42,.19,1.04)",
      }}
    >
      {/* Reduce vertical gap between rows */}
      <div className="w-[99vw] max-w-none mx-0 flex flex-col gap-1 justify-center">
        {rowSlides.map((rowVideos, ri) => {
          // Brick effect: horizontally shift every odd row (ri % 2 === 1)
          // Responsive: use different shifts on mobile/desktop
          const verticalOffset = ROW_VERTICAL_OFFSETS[ri] ?? 0;
          const cardOffset = getCardOffset();
          const isOdd = ri % 2 === 1;

          // Custom row style for brick offset and tight stacking
          const rowStyle: React.CSSProperties = {
            marginTop: verticalOffset > 0 ? `${verticalOffset}px` : undefined,
            marginBottom: verticalOffset < 0 ? `${-verticalOffset}px` : undefined,
          };

          // Inline style for translateX (mobile & desktop)
          const sliderStyle: React.CSSProperties = {
            width: `calc(${rowVideos.length * 24}vw)`,
            animation: `slideRow${ri} ${SLIDE_SECONDS[ri % SLIDE_SECONDS.length]}s linear infinite`,
            animationFillMode: "forwards",
            animationDelay: `${ri * 0.5}s`,
            display: "flex",
            flexDirection: "row" as const,
            alignItems: "center",
            // Apply translateX for brick effect
            transform: isOdd
              ? `translateX(${cardOffset.base}px)`
              : "translateX(0px)",
          };

          // For duplicated (seamless) row as well:
          const sliderStyleDup: React.CSSProperties = {
            ...sliderStyle,
            left: "100%",
            position: "absolute"
          };

          // Also, override translateX for desktop using media query
          // Will inject a style tag just once for the responsive shift
          useEffect(() => {
            const id = "carousel-brick-responsive-styles";
            if (document.getElementById(id)) return;
            const st = document.createElement("style");
            st.id = id;
            st.innerHTML = `
              @media (min-width: 768px) {
                .carousel-brick-offset-md {
                  transform: translateX(${cardOffset.md}px) !important;
                }
              }
            `;
            document.head.appendChild(st);
            return () => {
              const el = document.getElementById(id);
              if (el) el.remove();
            };
          }, []);

          // Add extra class for odd rows on desktop for responsive brick offset
          const brickRowClass =
            isOdd ? "carousel-brick-offset-md" : "";

          return (
            <div
              key={`carousel-row-${ri}`}
              className="relative flex overflow-hidden w-full h-44 md:h-52"
              tabIndex={-1}
              aria-roledescription="carousel row"
              style={rowStyle}
            >
              <div
                className={`flex gap-5 md:gap-8 ${brickRowClass}`}
                style={sliderStyle}
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
              {/* Duplicated row for seamless looping */}
              <div
                className={`flex gap-5 md:gap-8 absolute ${brickRowClass}`}
                style={sliderStyleDup}
              >
                {rowVideos.map((video, vi) =>
                  video ? (
                    <button
                      key={`dup-${video.id}-${vi}`}
                      className="aspect-video rounded-xl shadow-lg ring-2 ring-primary/20 overflow-hidden bg-white/80 hover:scale-110 transition-transform duration-300 flex-none w-44 md:w-60 cursor-pointer group"
                      onClick={() =>
                        video.video_id && video.video_id !== "-"
                          ? navigate(`/video/${video.video_id}`)
                          : undefined
                      }
                      aria-label={video.title}
                      tabIndex={-1}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:brightness-110"
                        draggable={false}
                      />
                    </button>
                  ) : (
                    <div key={`dup-empty-${vi}`} className="aspect-video rounded-lg bg-gray-200 w-44 md:w-60 animate-pulse" aria-hidden="true" />
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

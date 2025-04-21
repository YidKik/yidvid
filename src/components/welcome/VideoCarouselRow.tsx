
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Video {
  id: string;
  video_id: string;
  thumbnail: string;
  title: string;
}

interface VideoCarouselRowProps {
  rowIndex: number;
  videos: Video[];
  direction: "leftToRight" | "rightToLeft";
  animationDuration: number;
  verticalOffset?: number;
  placeholder?: boolean;
}

export const VideoCarouselRow: React.FC<VideoCarouselRowProps> = ({
  rowIndex,
  videos,
  direction,
  animationDuration,
  verticalOffset = 0,
  placeholder = false,
}) => {
  const navigate = useNavigate();
  const duplicated = [...videos, ...videos];
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add unique animation keyframes for each row if not already added
    const animationName = `slide-row-${rowIndex}`;
    if (document.getElementById(animationName)) return;

    const style = document.createElement("style");
    style.id = animationName;
    let fromTranslate = direction === "leftToRight" ? "-50%" : "0";
    let toTranslate = direction === "leftToRight" ? "0" : "-50%";
    style.innerHTML = `
      @keyframes ${animationName} {
        0% { transform: translateX(${fromTranslate}); }
        100% { transform: translateX(${toTranslate}); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById(animationName);
      if (el) el.remove();
    };
  }, [direction, rowIndex]);

  const rowStyle: React.CSSProperties = {
    marginTop: verticalOffset > 0 ? `${verticalOffset}px` : undefined,
    marginBottom: verticalOffset < 0 ? `${-verticalOffset}px` : undefined,
  };

  const sliderStyle: React.CSSProperties = {
    width: `calc(${duplicated.length * 28}vw)`, // slightly larger for larger videos
    animation: `slide-row-${rowIndex} ${animationDuration}s linear infinite`,
    animationFillMode: "forwards",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  };

  return (
    <div
      className="relative flex overflow-hidden w-full h-52 md:h-64"
      style={rowStyle}
      aria-roledescription="carousel row"
    >
      <div ref={sliderRef} className="flex gap-2 md:gap-3" style={sliderStyle}>
        {duplicated.map((video, vi) =>
          video ? (
            <button
              key={video.id + "-" + vi}
              className="aspect-video rounded-xl shadow-lg ring-2 ring-primary/20 overflow-hidden bg-white/80 hover:scale-110 transition-transform duration-300 flex-none w-60 md:w-80 cursor-pointer group"
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
            <div key={`empty-${vi}`} className="aspect-video rounded-lg bg-gray-200 w-60 md:w-80 animate-pulse" aria-hidden="true" />
          )
        )}
      </div>
    </div>
  );
};

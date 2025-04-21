
import React from "react";

/**
 * HomeLeftDiagonalFade
 * Solid semi-transparent box (instead of fade) covering the left half of the screen on top of videos,
 * to debug overlay visibility and layering.
 */
const HomeLeftDiagonalFade: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 h-[390px] md:h-[370px] lg:h-[350px] z-50"
      style={{
        width: "55vw",
        minWidth: 320,
        maxWidth: 720,
        backgroundColor: "rgba(180, 150, 250, 0.4)", // Solid purple translucent color for visibility
        borderBottom: "1.5px solid #b198f6",
        boxShadow: "0 1px 10px 0 rgba(120,76,200,0.3)",
        clipPath:
          "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", // Full rectangle (not diagonal clipped) for visibility
        transition: "opacity 0.7s",
      }}
      aria-hidden="true"
    />
  );
};

export default HomeLeftDiagonalFade;

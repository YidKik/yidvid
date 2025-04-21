
import React from "react";

/**
 * HomeLeftDiagonalFade
 * Diagonal gradient overlay covering the left half of the screen with a slanted right edge.
 * The overlay is positioned absolutely. The right edge is clipped diagonally.
 */
const HomeLeftDiagonalFade: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 h-[390px] md:h-[370px] lg:h-[350px] z-40"
      style={{
        width: "55vw",
        minWidth: 320,
        maxWidth: 720,
        background: "linear-gradient(100deg, rgba(231,225,255,0.93) 67%, rgba(253, 245, 255, 0.6) 95%, rgba(255,255,255,0.01) 100%)",
        borderBottom: "1.5px solid #b198f6",
        boxShadow: "0 1px 10px 0 rgba(120,76,200,0.06)",
        // angled cut: bottom right diagonal
        clipPath:
          "polygon(0 0, 97% 0, 72% 100%, 0% 100%)",
        transition: "opacity 0.7s",
      }}
      aria-hidden="true"
    />
  );
};

export default HomeLeftDiagonalFade;


import React from "react";

/**
 * HomeLeftDiagonalFade
 * Solid box covering the left half of the screen on top of videos,
 * with high visibility for debugging overlay issues.
 */
const HomeLeftDiagonalFade: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 h-[450px] z-[100]"
      style={{
        width: "50%",
        backgroundColor: "rgba(255, 0, 0, 0.5)", // Bright red with 50% opacity
        border: "3px solid red",
        boxShadow: "0 0 15px 0 rgba(255,0,0,0.5)",
      }}
      aria-hidden="true"
    />
  );
};

export default HomeLeftDiagonalFade;

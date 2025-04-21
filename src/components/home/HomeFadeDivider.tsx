
import React from "react";

/**
 * Overlay SVG divider: bold, crooked, solid (no fade).
 * Crooked divider starts from the top right and goes down to the bottom left,
 * creating a clear, prominent separation.
 */
export const HomeFadeDivider = () => (
  <div className="pointer-events-none absolute top-0 right-[56%] h-full w-[56%] z-30 hidden md:block">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 480 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {/* Draw a bold crooked divider: top right moves sharply to bottom left */}
      <path
        d="
          M 480 0           /* Start at the top right */
          Q 340 120 100 0   /* Crooked toward upper-left (top curve) */
          Q -40 450 100 900 /* Sweep diagonally to lower left (diagonal curve) */
          L 480 900         /* Bottom right corner */
          Z                /* Close path */
        "
        fill="#f1eaff"
      />
    </svg>
  </div>
);

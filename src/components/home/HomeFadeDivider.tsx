
import React from "react";

/**
 * Overlay SVG divider: semi-crooked, solid shape (no fade).
 * Crooked divider starts from the top right and curves down to the bottom left.
 * Used as visual divider between welcome text and video carousel.
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
      <path
        d="
          M 0 0
          Q 120 180 90 450
          Q 60 700 210 900
          L 480 900
          L 480 0
          Z
        "
        fill="#f1eaff"
      />
    </svg>
  </div>
);

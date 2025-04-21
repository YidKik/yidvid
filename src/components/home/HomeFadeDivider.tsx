
import React from "react";

/**
 * Overlay SVG divider: semi-crooked fade.
 * Adjusts to parent height and aligns between welcome and video sections.
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
      <defs>
        <linearGradient id="crookedFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f1eaff" stopOpacity="1" />
          <stop offset="70%" stopColor="#f1eaff" stopOpacity="0.7" />
          <stop offset="90%" stopColor="#f1eaff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f1eaff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="
          M 0 0 
          Q 60 120 50 300 
          Q 40 600 150 900 
          L 480 900
          L 480 0
          Z
        "
        fill="url(#crookedFade)"
      />
    </svg>
  </div>
);

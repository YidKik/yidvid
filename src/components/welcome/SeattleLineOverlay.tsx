
import React from "react";

// The overlay draws a diagonal "Seattle line" and a fade for videos that go under it.
export const SeattleLineOverlay: React.FC = () => {
  return (
    <>
      {/* Diagonal line - orange/yellow, visually close to screenshot */}
      <div
        style={{
          position: "absolute",
          left: "39vw",
          top: "-4vh",
          width: "15vw",
          height: "110vh",
          zIndex: 30,
          pointerEvents: "none",
          transform: "rotate(29deg)",
        }}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 700"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          {/* The line itself */}
          <polyline
            points="25,0 62,80 80,220 68,320 40,460 75,700"
            fill="none"
            stroke="#eaad26"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
            style={{
              filter: "drop-shadow(0 2px 22px #f8d445b7)",
            }}
          />
        </svg>
      </div>
      {/* Fade overlay: right-side of the line fading to solid background */}
      <div
        style={{
          position: "absolute",
          left: "47vw",
          top: "4vh",
          width: "54vw",
          height: "82vh",
          zIndex: 25,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, #b2a5ea 90%)",
        }}
        aria-hidden="true"
      />
    </>
  );
};

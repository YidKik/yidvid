
import React from "react";

const HomeLeftFadeOverlay: React.FC = () => {
  // This covers from the left up to half the screen, with a soft fade
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 h-full"
      style={{
        width: "55vw",
        background: "linear-gradient(90deg, rgba(227,222,255,0.8) 0%, rgba(245,223,255,0.76) 43%, rgba(255,255,255,0.04) 100%)",
        zIndex: 40,
        transition: "opacity 0.7s",
      }}
      aria-hidden="true"
    />
  );
};

export default HomeLeftFadeOverlay;

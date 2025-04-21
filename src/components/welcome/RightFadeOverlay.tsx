
import React from "react";

export const RightFadeOverlay: React.FC = () => {
  return (
    <div 
      className="absolute top-0 right-0 h-full w-3/5 pointer-events-none z-10"
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)",
        maskImage: "linear-gradient(to right, transparent, white)",
        WebkitMaskImage: "linear-gradient(to right, transparent, white)",
      }}
      aria-hidden="true"
    />
  );
};

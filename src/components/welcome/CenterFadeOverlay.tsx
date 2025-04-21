
import React from "react";

/**
 * A vertical fade overlay, fading out from the center of the screen to transparent on both left and right.
 * This is used to fade the video rows near the center, so videos appear to "emerge" from/into the center.
 */
export const CenterFadeOverlay: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 w-full h-full z-40"
      style={{
        // This creates a vertical fade in the center of screen with 40vw width, 30vw strong fade
        background:
          "linear-gradient(90deg, rgba(178,165,234,1) 0%, rgba(178,165,234,0) 25%, rgba(178,165,234,0) 75%, rgba(178,165,234,1) 100%)",
        opacity: 0.55, // soften
        height: "100%",
      }}
      aria-hidden="true"
    />
  );
};

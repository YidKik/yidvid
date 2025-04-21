
import React from "react";

/**
 * This SVG shape covers the top-right part of the page with a diagonal fade,
 * matching the sketch provided and is meant to overlay the video grid carousel.
 * The gradient fade blends softly into the animated gradient background.
 */
const WelcomeTopShape: React.FC = () => (
  <svg
    viewBox="0 0 1400 500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    className="absolute top-0 right-0 w-full h-[48vh] md:h-[57vh] z-10 pointer-events-none"
    preserveAspectRatio="none"
    aria-hidden="true"
    style={{
      minHeight: 280,
      maxHeight: 380,
      filter: "drop-shadow(0px 4px 38px #9b87f553)",
      userSelect: "none",
      transition: 'opacity 1s',
    }}
  >
    <defs>
      <linearGradient id="fade-right" x1="950" y1="0" x2="1450" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff" stopOpacity="0.74" />
        <stop offset="0.42" stopColor="#fff" stopOpacity="0.56" />
        <stop offset="0.87" stopColor="#fff" stopOpacity="0.11" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="
        M0,0 
        L1400,0 
        L1400,350 
        Q1100,520 760,400 
        L0,500 
        Z"
      fill="url(#fade-right)"
    />
  </svg>
);

export default WelcomeTopShape;

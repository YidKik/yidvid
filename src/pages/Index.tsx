
import React from "react";
import HomeLeftDiagonalFade from "@/components/welcome/HomeLeftDiagonalFade";
import { VideoRows } from "@/components/welcome/VideoRows";
import { WelcomeHeader } from "@/components/welcome/WelcomeHeader";

export default function Index() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden overflow-y-auto bg-purple-100">
      {/* Content container with proper z-indexing */}
      <div className="relative w-full flex-1">
        {/* Diagonal (angled) fade overlay (positioned on top) */}
        <HomeLeftDiagonalFade />
        
        {/* Welcome header (positioned on top of diagonal fade) */}
        <div className="relative z-[51] pt-8 md:pt-16 px-6 md:px-12 lg:px-16">
          <WelcomeHeader />
        </div>
        
        {/* "Welcome to edit" debug message overlay on the left side */}
        <div 
          className="pointer-events-none absolute top-20 left-4 z-[9999] bg-yellow-400 text-black px-4 py-2 rounded shadow-lg select-none"
        >
          Welcome to edit
        </div>

        {/* Video rows (positioned below in z-index) */}
        <div className="relative z-20 mt-32 md:mt-40 lg:mt-48">
          <VideoRows />
        </div>
      </div>
    </div>
  );
}

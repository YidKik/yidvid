
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

        {/* Overlay message+logo box (centered, on top of videos) */}
        <div
          className="pointer-events-none absolute left-1/2 top-[43%] z-[70] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        >
          <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-xl shadow-lg px-8 py-6 min-w-[220px] backdrop-blur-xl bg-white/60 border border-primary animate-fade-in">
            <img
              src="/public/yidkik-logo.png"
              alt="Logo"
              className="h-14 w-auto mb-2"
              draggable={false}
            />
            <span className="text-xl font-semibold text-primary drop-shadow">
              Welcome to edit
            </span>
          </div>
        </div>

        {/* Video rows (positioned below in z-index) */}
        <div className="relative z-20 mt-32 md:mt-40 lg:mt-48">
          <VideoRows />
        </div>
      </div>
    </div>
  );
}

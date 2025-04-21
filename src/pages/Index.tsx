
import React from "react";
import { VideoRows } from "@/components/welcome/VideoRows";
import { SeattleLineOverlay } from "@/components/welcome/SeattleLineOverlay";

export default function Index() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden overflow-y-auto" style={{ background: "#b2a5ea" }}>
      <div className="relative w-full flex-1">
        {/* Welcome Overlay Box (left, on top of videos) */}
        <div
          className="pointer-events-none absolute z-50 left-0 top-8 md:top-12"
          style={{
            width: "48vw",
            maxWidth: 650,
            minWidth: 280,
          }}
        >
          <div className="pointer-events-auto m-4 md:m-8 rounded-xl shadow-2xl px-8 py-7 backdrop-blur-lg bg-white/70 border border-primary flex flex-col gap-4 animate-fade-in">
            {/* Logo and title */}
            <div className="flex items-center gap-5 mb-2">
              <img
                src="/lovable-uploads/d52a0f5f-27b6-45a1-9f01-ccaaf954d3b0.png"
                alt="YidVid Logo"
                className="h-20 w-auto"
                draggable={false}
              />
              <span className="text-5xl font-black text-gray-900 leading-none">
                YidVid
              </span>
            </div>
            <span className="text-3xl font-bold text-primary mb-1 mt-1" style={{ color: "#e4324b" }}>
              Welcome to YidVid
            </span>
            <p className="text-xl text-gray-800 font-normal leading-relaxed mt-1">
              Your gateway to curated Jewish content.<br />
              Discover videos that inspire, entertain, and connect.
            </p>
          </div>
        </div>

        {/* Seattle diagonal line + fade overlay (on top of/over videos) */}
        <SeattleLineOverlay />

        {/* Video rows - made higher up by reducing top margin */}
        <div className="relative z-10 mt-8 md:mt-14 lg:mt-20">
          <VideoRows />
        </div>
      </div>
    </div>
  );
}

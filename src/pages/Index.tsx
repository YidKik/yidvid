import React from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { HomeHero } from "@/components/home/HomeHero";
import { AnimatedVideoRows } from "@/components/home/AnimatedVideoRows";

export default function Index() {
  const { videos, loading } = useVideoGridData(50);

  return (
    <div className="min-h-screen w-full bg-[#f1eaff] flex items-stretch relative overflow-x-hidden">
      {/* Main grid: Left = Hero, Right = Videos */}
      <div className="flex flex-1 items-stretch max-w-[1920px] mx-auto relative w-full">
        {/* Left side: Welcome, vertically and horizontally centered and taller */}
        <div className="w-full md:w-[44%] flex flex-col justify-center z-20 px-6 md:px-0">
          <div className="md:pl-[6vw] flex flex-col justify-center h-[75vh]">
            {/* Logo and welcome */}
            <div className="flex flex-col items-center md:items-start justify-center h-full">
              {/* Logo */}
              <img
                src="/yidkik-logo.png"
                alt="YidVid Logo"
                className="w-[150px] md:w-[200px] h-auto mb-5"
                draggable={false}
                style={{ filter: "drop-shadow(0 2px 12px rgba(70,0,70,.06))" }}
              />
              {/* Welcome text */}
              <h1 className="text-center md:text-left text-4xl md:text-6xl font-black mb-3 mt-2">
                <span className="text-[#ea384c]">Welcome to YidVid</span>
              </h1>
              <div className="text-center md:text-left text-lg md:text-2xl text-gray-700 max-w-md mb-1">
                Your gateway to curated Jewish content.
              </div>
              <p className="text-center md:text-left text-base md:text-lg text-gray-600 opacity-95 mb-3">
                Discover videos that inspire, entertain, and connect.
              </p>
            </div>
          </div>
        </div>
        {/* Crooked SVG fade, overlays the dividing line */}
        <div className="pointer-events-none absolute top-0 right-[56%] h-full w-[56%] z-30 hidden md:block">
          <svg width="100%" height="100%" viewBox="0 0 480 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <defs>
              <linearGradient id="fadeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f1eaff" stopOpacity="1" />
                <stop offset="96%" stopColor="#f1eaff" stopOpacity="0.4" />
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
              fill="url(#fadeGrad)"
            />
          </svg>
        </div>
        {/* Right: Animated Videos */}
        <div className="hidden md:block w-[56%] relative z-10 pl-[-10vw]">
          <div className="h-full flex items-center">
            <AnimatedVideoRows videos={videos || []} isLoading={loading} />
          </div>
        </div>
        {/* On mobile: Stack vertically, no svg fade */}
        <div className="block md:hidden w-full relative z-10">
          <AnimatedVideoRows videos={videos || []} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}

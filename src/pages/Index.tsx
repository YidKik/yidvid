
import React from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { HomeHero } from "@/components/home/HomeHero";
import { AnimatedVideoRows } from "@/components/home/AnimatedVideoRows";

export default function Index() {
  // Get enough videos to fill all carousels, more if possible
  const { videos, loading } = useVideoGridData(50);

  return (
    <div className="min-h-screen w-full bg-[#f1eaff] flex items-stretch relative overflow-x-hidden">
      <div className="flex flex-1 items-stretch max-w-[1920px] mx-auto relative">
        {/* Left greeting/branding (about 40% width on desktop) */}
        <div className="w-full md:w-[44%] flex flex-col justify-center z-20">
          <HomeHero />
        </div>
        {/* Right videos with fade overlay */}
        <div className="hidden md:block w-[56%] relative z-10">
          <AnimatedVideoRows videos={videos || []} isLoading={loading} />
          {/* Left fade overlay for "slide-out" look */}
          <div
            className="absolute top-0 left-0 h-full w-52 z-30 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, #f1eaff 70%, rgba(241,234,255,0) 100%)"
            }}
          />
          {/* Right fade for video overflow */}
          <div
            className="absolute top-0 right-0 h-full w-28 z-30 pointer-events-none"
            style={{
              background: "linear-gradient(270deg, #f1eaff 60%, rgba(241,234,255,0) 100%)"
            }}
          />
        </div>
        {/* On mobile: stack vertically, videos below logo. */}
        <div className="block md:hidden w-full relative z-10">
          <AnimatedVideoRows videos={videos || []} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useNavigate } from "react-router-dom";
import { HomeFadeDivider } from "@/components/home/HomeFadeDivider";
import { AnimatedVideoRows } from "@/components/home/AnimatedVideoRows";

export default function Index() {
  const { videos, loading } = useVideoGridData(50);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#f1eaff] flex items-stretch relative overflow-x-hidden">
      <div className="flex flex-1 items-stretch max-w-[1920px] mx-auto relative w-full">
        {/* Left: Welcome Area */}
        <div className="w-full md:w-[44%] flex flex-col justify-start z-20 px-6 md:px-0 relative">
          <div className="md:pl-[6vw] flex flex-col justify-start" style={{ minHeight: "77vh" }}>
            <div className="flex flex-col items-center md:items-start justify-start h-full pt-12 md:pt-14">
              {/* Logo */}
              <img
                src="/yidkik-logo.png"
                alt="YidVid Logo"
                className="w-[180px] md:w-[220px] h-auto mb-6"
                draggable={false}
                style={{ filter: "drop-shadow(0 2px 12px rgba(70,0,70,.08))" }}
              />
              <div className="bg-[#efe0fc]/60 rounded-xl shadow-md px-6 py-8 md:px-12 mb-2 md:mb-0">
                <h1 className="text-center md:text-left text-3xl md:text-5xl font-black font-sans mb-4 mt-0">
                  <span className="text-[#ea384c]">Welcome to YidVid</span>
                </h1>
                <div className="text-center md:text-left text-lg md:text-2xl text-gray-700 max-w-md mb-2">
                  Your gateway to curated Jewish content.
                </div>
                <p className="text-center md:text-left text-base md:text-lg text-gray-600 opacity-95 mb-0">
                  Discover videos that inspire, entertain, and connect.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Crooked SVG fade divider */}
        <HomeFadeDivider />
        {/* Right: Animated Videos */}
        <div className="hidden md:block w-[56%] relative z-10">
          <div className="h-full flex items-center">
            <AnimatedVideoRows
              videos={videos || []}
              isLoading={loading}
              onVideoClick={(videoId) => navigate(`/video/${videoId}`)}
            />
          </div>
        </div>
        {/* Mobile: Stack vertically, no SVG fade */}
        <div className="block md:hidden w-full relative z-10">
          <AnimatedVideoRows
            videos={videos || []}
            isLoading={loading}
            onVideoClick={(videoId) => navigate(`/video/${videoId}`)}
          />
        </div>
      </div>
    </div>
  );
}

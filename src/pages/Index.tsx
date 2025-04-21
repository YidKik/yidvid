
import React from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useIsMobile } from "@/hooks/use-mobile";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { VideoCarousels } from "@/components/home/VideoCarousels";

export default function Index() {
  const { videos, loading } = useVideoGridData(50); // Fetch more videos for the carousels
  const { isMobile } = useIsMobile();

  console.log("Index page rendering with", videos?.length || 0, "videos");

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f8f6ff] to-[#f1f1f7] overflow-hidden">
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} min-h-screen relative`}>
        {/* Welcome section (left side) */}
        <WelcomeSection />
        
        {/* Video carousels section (right side) */}
        <VideoCarousels videos={videos || []} isLoading={loading} />
      </div>
    </div>
  );
}

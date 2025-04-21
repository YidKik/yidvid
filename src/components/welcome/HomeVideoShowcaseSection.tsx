
import React from "react";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

interface HomeVideoShowcaseSectionProps {
  loading: boolean;
  videos: VideoItemType[];
  children: React.ReactNode;
}

export const HomeVideoShowcaseSection = ({
  loading,
  videos,
  children,
}: HomeVideoShowcaseSectionProps) => {
  if (loading || !videos.length) {
    return (
      <div className="w-full flex flex-col items-center py-8">
        <span className="text-2xl font-bold text-purple-400 mb-4 animate-pulse">
          Loading featured videos...
        </span>
      </div>
    );
  }

  // Maximized container with absolutely no constraining styles
  // Added styling to ensure maximum space utilization
  return (
    <div 
      className="w-screen h-screen overflow-hidden fixed inset-0" 
      style={{
        minWidth: "100vw",
        minHeight: "100vh",
        transform: "scale(1.2)", // Force scale up to ensure full coverage
      }}
    >
      {children}
    </div>
  );
};

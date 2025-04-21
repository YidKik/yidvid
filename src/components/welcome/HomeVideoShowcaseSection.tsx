
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

  return (
    <div className="w-full max-w-7xl mx-auto py-10 md:py-14 bg-gradient-to-br from-[#f6dbf5]/40 to-[#ffe29f]/40 rounded-3xl shadow-lg border border-white/30 backdrop-blur-md">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-primary via-accent to-pink-400 bg-clip-text text-transparent animate-fade-in drop-shadow-lg">
        Latest Videos
      </h2>
      {children}
    </div>
  );
};

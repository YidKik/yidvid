
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

  // Maximized container with no constraining styles
  return (
    <div className="w-full h-full overflow-hidden">
      {children}
    </div>
  );
};

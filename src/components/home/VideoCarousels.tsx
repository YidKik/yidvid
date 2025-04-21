import React from "react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { VideoCarousel } from "./VideoCarousel";

interface VideoCarouselsProps {
  videos: VideoGridItemType[];
  isLoading: boolean;
  onVideoClick?: (videoId: string) => void;
}

function getSortedVideos(videos: VideoGridItemType[]): VideoGridItemType[] {
  return [...videos].sort((a, b) => {
    const dateA = new Date(a.uploadedAt).getTime();
    const dateB = new Date(b.uploadedAt).getTime();
    return dateB - dateA;
  });
}

export const VideoCarousels = ({ videos, isLoading, onVideoClick }: VideoCarouselsProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedVideos = getSortedVideos(videos);
  if (!sortedVideos.length) return null;

  // Use different shuffle keys for each row so that order differs
  const rowShuffleKeys = [1, 2, 3];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden">
        <VideoCarousel 
          videos={sortedVideos} 
          direction="ltr" 
          speed={40} 
          shuffleKey={rowShuffleKeys[0]} 
          onVideoClick={onVideoClick}
        />
      </div>
      
      <div className="overflow-hidden">
        <VideoCarousel 
          videos={sortedVideos} 
          direction="rtl" 
          speed={30} 
          shuffleKey={rowShuffleKeys[1]} 
          onVideoClick={onVideoClick}
        />
      </div>
      
      <div className="overflow-hidden">
        <VideoCarousel 
          videos={sortedVideos} 
          direction="ltr" 
          speed={35} 
          shuffleKey={rowShuffleKeys[2]} 
          onVideoClick={onVideoClick}
        />
      </div>
    </div>
  );
};

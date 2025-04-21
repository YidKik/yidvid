
import React from 'react';
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";

export default function WritingVideos() {
  const { videos, loading } = useVideoGridData(12); // Fetch 12 videos initially

  return (
    <div className="min-h-screen bg-[#f8f2ff] py-8 px-4 md:px-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <img 
            src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
            alt="YidVid Logo"
            className="h-16 md:h-20"
            draggable={false}
          />
        </div>

        {/* Title Section */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Writing YidVid videos
        </h1>

        {/* Video Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            // Loading placeholders
            Array.from({ length: 8 }).map((_, index) => (
              <div 
                key={index}
                className="aspect-video bg-gray-200 rounded-lg animate-pulse"
              />
            ))
          ) : (
            // Actual videos
            videos.map((video) => (
              <div 
                key={video.id}
                className="cursor-pointer transform transition-transform duration-200 hover:scale-105"
                onClick={() => window.location.href = `/video/${video.video_id}`}
              >
                <VideoGridItem video={video} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

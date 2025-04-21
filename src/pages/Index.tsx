
import React from "react";
import { VideoCarousels } from "@/components/home/VideoCarousels";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";

export default function Index() {
  const { videos, loading } = useVideoGridData(30);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex relative overflow-hidden">
      {/* Left side - Text content */}
      <div className="w-full md:w-[40%] p-8 md:p-16 flex flex-col justify-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-700 mb-6">
          YidVid
        </h1>
        <h2 className="text-2xl md:text-3xl text-gray-600 mb-4">
          Writing about
        </h2>
        <p className="text-lg text-gray-500">
          Your trusted source for Jewish content and wisdom, bringing together the best videos from across the community.
        </p>
      </div>

      {/* Diagonal divider */}
      <div 
        className="absolute top-0 left-[35%] md:left-[38%] w-[100px] h-full bg-gray-50 transform rotate-6 origin-top-left z-20"
        style={{
          boxShadow: "-10px 0 15px -5px rgba(0,0,0,0.1)"
        }}
      />

      {/* Right side - Video carousels */}
      <div className="hidden md:block absolute right-0 top-0 w-[65%] h-full overflow-hidden bg-gray-100">
        <div className="h-full flex items-center">
          {videos && videos.length > 0 && (
            <VideoCarousels videos={videos} isLoading={loading} />
          )}
        </div>
      </div>

      {/* Mobile video carousels */}
      <div className="md:hidden w-full mt-8">
        {videos && videos.length > 0 && (
          <VideoCarousels videos={videos} isLoading={loading} />
        )}
      </div>
    </div>
  );
}

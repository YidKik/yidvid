
import React from "react";
import { VideoCarousels } from "@/components/home/VideoCarousels";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { videos, loading } = useVideoGridData(30);
  const navigate = useNavigate();

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex relative overflow-hidden">
      {/* Left side - Text content */}
      <div className="w-full md:w-[15%] p-8 md:p-12 flex flex-col justify-center z-10">
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

      {/* Diagonal divider - moved further right */}
      <div 
        className="absolute top-0 left-[35%] md:left-[38%] w-[100px] h-full bg-gray-100 transform rotate-12 origin-top-left z-20"
      />

      {/* Right side - Video carousels */}
      <div className="hidden md:block absolute right-0 top-0 w-[90%] h-full overflow-hidden bg-gray-100">
        <div className="h-full flex items-center">
          {videos && videos.length > 0 && (
            <VideoCarousels 
              videos={videos} 
              isLoading={loading}
              onVideoClick={handleVideoClick}
            />
          )}
        </div>
      </div>

      {/* Mobile video carousels */}
      <div className="md:hidden w-full mt-8">
        {videos && videos.length > 0 && (
          <VideoCarousels 
            videos={videos} 
            isLoading={loading}
            onVideoClick={handleVideoClick}
          />
        )}
      </div>
    </div>
  );
}

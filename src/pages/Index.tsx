
import React from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { VideoCarousels } from "@/components/home/VideoCarousels";

export default function Index() {
  const { videos, loading } = useVideoGridData(50); // Fetch more videos for the carousels

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <VideoCarousels videos={videos || []} isLoading={loading} />
      </div>
    </div>
  );
}

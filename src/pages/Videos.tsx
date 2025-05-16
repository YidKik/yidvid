
import Auth from "@/pages/Auth";
import { useState } from "react";
import { useVideos } from "@/hooks/video/useVideos";
import { VideoPageContent } from "@/components/videos/VideoPageContent";
import { SEOHelmet } from "@/components/videos/SEOHelmet";

const Videos = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // Get videos data
  const { 
    data: videos, 
    isLoading,
    isRefreshing,
    error
  } = useVideos();
  
  return (
    <>
      <SEOHelmet videos={videos} path="/videos" />
      
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 videos-page">
        <VideoPageContent 
          videos={videos} 
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          error={error}
        />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </>
  );
};

export default Videos;

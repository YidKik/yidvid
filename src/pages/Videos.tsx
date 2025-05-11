
import Auth from "@/pages/Auth";
import { useState } from "react";
import { useVideos } from "@/hooks/video/useVideos";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useSearchParams } from "react-router-dom";
import { VideoPageContent } from "@/components/videos/VideoPageContent";
import { SEOHelmet } from "@/components/videos/SEOHelmet";

const Videos = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { data: videos } = useVideos();
  const [searchParams] = useSearchParams();
  
  return (
    <>
      <SEOHelmet videos={videos} path="/videos" />
      
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 videos-page">
        <VideoPageContent />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </>
  );
};

export default Videos;

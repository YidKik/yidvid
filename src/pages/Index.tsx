import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import VideoGrid from "@/components/VideoGrid";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import Auth from "@/pages/Auth";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { motion } from "framer-motion";
import { MusicGrid } from "@/components/music/MusicGrid";
import { useIsMobile } from "@/hooks/use-mobile";

const MainContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const isMobile = useIsMobile();
  const { state } = useSidebar();
  
  const { data: videos, isLoading } = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      return (data || []).map(video => ({
        id: video.id,
        video_id: video.video_id,
        title: video.title,
        thumbnail: video.thumbnail,
        channelName: video.channel_name,
        channelId: video.channel_id,
        views: video.views || 0,
        uploadedAt: video.uploaded_at
      }));
    },
  });

  // Sort videos by views to get most viewed videos
  const sortedVideos = videos ? [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)) : [];

  return (
    <div className={`flex-1 ${
      state === "collapsed" 
        ? "pl-4 md:pl-20" 
        : "pl-4"
    }`}>
      <Header />
      <main className="mt-4 md:mt-8 max-w-[1400px]">
        <div className="w-full py-4 md:py-6">
          <div className="relative w-[240px] h-12 mx-auto bg-gray-100 rounded-full p-1.5 cursor-pointer mb-4 md:mb-8 shadow-sm hover:shadow-md transition-shadow"
               onClick={() => setIsMusic(!isMusic)}>
            <div className="relative w-full h-full flex items-center justify-between px-8 text-sm font-medium">
              <span className={`z-10 transition-colors duration-200 ${!isMusic ? 'text-white' : 'text-gray-600'}`}>
                Videos
              </span>
              <span className={`z-10 transition-colors duration-200 ${isMusic ? 'text-white' : 'text-gray-600'}`}>
                Music
              </span>
              <motion.div
                className="absolute top-0 left-0 w-[108px] h-full bg-primary rounded-full"
                animate={{
                  x: isMusic ? 128 : 2
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              />
            </div>
          </div>

          <motion.div
            key={isMusic ? "music" : "videos"}
            initial={{ opacity: 0, x: isMusic ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMusic ? -20 : 20 }}
            transition={{ duration: 0.3 }}
          >
            {!isMusic ? (
              <>
                <div className="video-grid">
                  <VideoGrid 
                    videos={videos} 
                    maxVideos={isMobile ? 6 : 12} 
                    rowSize={isMobile ? 1 : 4} 
                    isLoading={isLoading}
                  />
                </div>
                {sortedVideos && sortedVideos.length > 0 && (
                  <div className="mt-8 md:mt-12">
                    <MostViewedVideos videos={sortedVideos} />
                  </div>
                )}
                <div className="channels-grid mt-8 md:mt-12">
                  <ChannelsGrid />
                </div>
              </>
            ) : (
              <div className="relative min-h-[60vh] md:min-h-[70vh]">
                <div className="absolute inset-0 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-4 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary animate-fade-in">Coming Soon!</h2>
                  <p className="text-base md:text-lg text-gray-800 max-w-2xl animate-fade-in delay-100">
                    We're working on bringing you an amazing collection of kosher entertainment music. 
                    Stay tuned for a curated selection of artists and tracks that will elevate your listening experience!
                  </p>
                </div>
                <div className="opacity-30">
                  <MusicGrid />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <MainContent />
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </SidebarProvider>
  );
};

export default Index;
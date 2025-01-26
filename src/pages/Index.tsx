import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import VideoGrid from "@/components/VideoGrid";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { SidebarProvider } from "@/components/ui/sidebar";
import Auth from "@/pages/Auth";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { motion } from "framer-motion";
import { MusicGrid } from "@/components/music/MusicGrid";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMusic, setIsMusic] = useState(false);

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

  const { data: mostViewedVideos } = useQuery({
    queryKey: ["most_viewed_videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("views", { ascending: false })
        .not("views", "is", null)
        .limit(12);

      if (error) {
        console.error("Error fetching most viewed videos:", error);
        throw error;
      }

      return (data || []).map(video => ({
        id: video.video_id,
        uuid: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        channelName: video.channel_name,
        channelId: video.channel_id,
        views: video.views || 0,
        uploadedAt: video.uploaded_at
      }));
    },
  });

  return (
    <SidebarProvider defaultOpen={false}>
      <WelcomeAnimation />
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="mt-16">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <div className="relative w-[200px] h-10 mx-auto bg-gray-100 rounded-full p-1 cursor-pointer"
                   onClick={() => setIsMusic(!isMusic)}>
                <div className="relative w-full h-full flex items-center justify-between px-4 text-sm font-medium">
                  <span className={`z-10 transition-colors duration-200 ${!isMusic ? 'text-white' : 'text-gray-600'}`}>
                    Videos
                  </span>
                  <span className={`z-10 transition-colors duration-200 ${isMusic ? 'text-white' : 'text-gray-600'}`}>
                    Music
                  </span>
                  <motion.div
                    className="absolute top-0 left-0 w-[90px] h-full bg-primary rounded-full"
                    animate={{
                      x: isMusic ? 106 : 2
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  />
                </div>
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
                  <div className="video-grid mt-4">
                    <VideoGrid 
                      videos={videos} 
                      maxVideos={12} 
                      rowSize={4} 
                      isLoading={isLoading}
                    />
                  </div>
                  {mostViewedVideos && mostViewedVideos.length > 0 && (
                    <div className="mt-8">
                      <MostViewedVideos videos={mostViewedVideos} />
                    </div>
                  )}
                  <div className="channels-grid">
                    <ChannelsGrid />
                  </div>
                </>
              ) : (
                <MusicGrid />
              )}
            </motion.div>
          </main>
        </div>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </SidebarProvider>
  );
};

export default Index;
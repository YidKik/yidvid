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
import { Slider } from "@/components/ui/slider";
import { MusicGrid } from "@/components/MusicGrid";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState([0]);

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

  const isMusic = sliderValue[0] >= 50;

  return (
    <SidebarProvider defaultOpen={false}>
      <WelcomeAnimation />
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="mt-16">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-8">
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  !isMusic ? "text-primary" : "text-muted-foreground"
                )}>
                  Videos
                </span>
                <div className="w-[200px] px-4">
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isMusic ? "text-primary" : "text-muted-foreground"
                )}>
                  Music
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isMusic ? (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              ) : (
                <motion.div
                  key="music"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MusicGrid maxTracks={12} rowSize={4} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </SidebarProvider>
  );
};

export default Index;
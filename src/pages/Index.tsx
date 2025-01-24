import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import VideoGrid from "@/components/VideoGrid";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { SidebarProvider } from "@/components/ui/sidebar";
import Auth from "@/pages/Auth";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Music, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeView, setActiveView] = useState("videos");
  const navigate = useNavigate();

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
        .not("views", "is", null)  // Only include videos with views
        .limit(12);

      if (error) {
        console.error("Error fetching most viewed videos:", error);
        throw error;
      }

      return (data || []).map(video => ({
        id: video.video_id,  // Using video_id for consistent routing
        title: video.title,
        thumbnail: video.thumbnail,
        channelName: video.channel_name,
        channelId: video.channel_id,
        views: video.views || 0,
        uploadedAt: video.uploaded_at
      }));
    },
  });

  const handleViewChange = (value: string) => {
    if (value === "music") {
      navigate("/music");
    } else {
      setActiveView("videos");
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="mt-16">
            <div className="flex justify-center my-6 px-4">
              <div className="relative bg-white shadow-xl p-1 w-80 h-12">
                <div 
                  className={`absolute inset-y-0 w-1/2 bg-primary transition-transform duration-300 ease-out ${
                    activeView === "videos" ? "translate-x-0" : "translate-x-full"
                  }`}
                />
                <ToggleGroup
                  type="single"
                  value={activeView}
                  onValueChange={handleViewChange}
                  className="relative grid grid-cols-2 h-full"
                >
                  <ToggleGroupItem 
                    value="videos" 
                    aria-label="Toggle videos"
                    className="relative z-10 px-6 transition-all duration-300 data-[state=on]:text-white data-[state=off]:text-primary font-medium"
                  >
                    <Video className="w-4 h-4 mr-2 inline-block" />
                    Videos
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="music" 
                    aria-label="Toggle music"
                    className="relative z-10 px-6 transition-all duration-300 data-[state=on]:text-white data-[state=off]:text-primary font-medium"
                  >
                    <Music className="w-4 h-4 mr-2 inline-block" />
                    Music
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
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
          </main>
        </div>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </SidebarProvider>
  );
};

export default Index;
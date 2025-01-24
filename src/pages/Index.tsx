import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { VideoGrid } from "@/components/VideoGrid";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { SidebarProvider } from "@/components/ui/sidebar";
import Auth from "@/pages/Auth";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Music, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeView, setActiveView] = useState("videos");
  const navigate = useNavigate();

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
              <div className="relative bg-white rounded-full shadow-md p-1 w-64">
                <div 
                  className={`absolute inset-y-1 w-1/2 bg-primary rounded-full transition-transform duration-300 ease-out ${
                    activeView === "videos" ? "translate-x-0" : "translate-x-full"
                  }`}
                />
                <ToggleGroup
                  type="single"
                  value={activeView}
                  onValueChange={handleViewChange}
                  className="relative grid grid-cols-2 gap-1"
                >
                  <ToggleGroupItem 
                    value="videos" 
                    aria-label="Toggle videos"
                    className="relative z-10 px-6 py-2 transition-all duration-200 data-[state=on]:text-white"
                  >
                    <Video className="w-4 h-4 mr-2 inline-block" />
                    Videos
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="music" 
                    aria-label="Toggle music"
                    className="relative z-10 px-6 py-2 transition-all duration-200 data-[state=on]:text-white"
                  >
                    <Music className="w-4 h-4 mr-2 inline-block" />
                    Music
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            <div className="video-grid mt-4">
              <VideoGrid maxVideos={12} rowSize={4} />
            </div>
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
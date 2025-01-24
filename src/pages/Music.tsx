import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Auth from "@/pages/Auth";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Music, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MusicGrid } from "@/components/MusicGrid";

const MusicPage = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeView, setActiveView] = useState("music");
  const navigate = useNavigate();

  const handleViewChange = (value: string) => {
    if (value === "videos") {
      navigate("/");
    } else {
      setActiveView("music");
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
              <ToggleGroup
                type="single"
                value={activeView}
                onValueChange={handleViewChange}
                className="border rounded-full p-1 bg-white shadow-sm"
              >
                <ToggleGroupItem 
                  value="videos" 
                  aria-label="Toggle videos"
                  className="data-[state=on]:bg-primary data-[state=on]:text-white rounded-full px-6 py-2 transition-all duration-200"
                >
                  <Video className="w-4 h-4 mr-2 inline-block" />
                  Videos
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="music" 
                  aria-label="Toggle music"
                  className="data-[state=on]:bg-primary data-[state=on]:text-white rounded-full px-6 py-2 transition-all duration-200"
                >
                  <Music className="w-4 h-4 mr-2 inline-block" />
                  Music
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="music-grid mt-4">
              <MusicGrid maxTracks={12} rowSize={4} />
            </div>
          </main>
        </div>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </SidebarProvider>
  );
};

export default MusicPage;
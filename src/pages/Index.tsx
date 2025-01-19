import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { VideoGrid } from "@/components/VideoGrid";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { SidebarProvider } from "@/components/ui/sidebar";
import Auth from "@/pages/Auth";
import { useState } from "react";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1">
          <Header onSignInClick={() => setIsAuthOpen(true)} />
          <main className="mt-16">
            <div className="video-grid">
              <VideoGrid />
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
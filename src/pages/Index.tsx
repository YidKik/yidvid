import { Header } from "@/components/Header";
import Auth from "@/pages/Auth";
import { useState } from "react";
import { motion } from "framer-motion";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { CategorySection } from "@/components/categories/CategorySection";
import { ContentToggle } from "@/components/content/ContentToggle";
import { MusicSection } from "@/components/content/MusicSection";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";

const MainContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const { data: videos, isLoading } = useVideos();
  const isMobile = useIsMobile();

  return (
    <div className="flex-1">
      <Header />
      <main className="mt-3 md:mt-6 max-w-[1400px] mx-auto px-3 md:px-6">
        <div className={`space-y-4 md:space-y-6 ${isMobile ? 'pb-16' : ''}`}>
          <ContentToggle 
            isMusic={isMusic} 
            onToggle={() => setIsMusic(!isMusic)} 
          />

          <CategorySection />

          <motion.div
            key={isMusic ? "music" : "videos"}
            initial={{ opacity: 0, x: isMusic ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMusic ? -20 : 20 }}
            transition={{ duration: 0.3 }}
          >
            {!isMusic ? (
              <VideoContent videos={videos} isLoading={isLoading} />
            ) : (
              <MusicSection />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen w-full">
      <WelcomeAnimation />
      <MainContent />
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  );
};

export default Index;

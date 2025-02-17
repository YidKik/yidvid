
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

const MainContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const { data: videos, isLoading } = useVideos();

  return (
    <div className="flex-1">
      <Header />
      <main className="mt-4 md:mt-6 max-w-[1400px] mx-auto px-4 md:px-6">
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
          className="mt-4"
        >
          {!isMusic ? (
            <VideoContent videos={videos} isLoading={isLoading} />
          ) : (
            <MusicSection />
          )}
        </motion.div>
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

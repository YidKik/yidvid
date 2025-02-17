
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
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { useSessionManager } from "@/hooks/useSessionManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GlobalNotification } from "@/components/notifications/GlobalNotification";

const MainContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const { data: videos, isLoading } = useVideos();
  const isMobile = useIsMobile();
  const { session, handleLogout } = useSessionManager();

  const markNotificationsAsRead = async () => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from("video_notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <div className="flex-1">
      <Header />
      <GlobalNotification />
      <main className="mt-2 md:mt-6 mx-auto px-2 md:px-6 max-w-[1400px]">
        <div className={`space-y-8 md:space-y-12 ${isMobile ? 'pb-20' : ''}`}>
          <ContentToggle 
            isMusic={isMusic} 
            onToggle={() => setIsMusic(!isMusic)} 
          />
          
          <CategorySection />

          <motion.div
            key={isMusic ? "music" : "videos"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={isMobile ? 'mt-2' : ''}
          >
            {!isMusic ? (
              <VideoContent videos={videos} isLoading={isLoading} />
            ) : (
              <MusicSection />
            )}
          </motion.div>
        </div>
      </main>
      {isMobile && (
        <MobileBottomNav 
          session={session}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
      <WelcomeAnimation />
      <MainContent />
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  );
};

export default Index;

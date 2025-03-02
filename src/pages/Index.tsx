
import { Header } from "@/components/Header";
import Auth from "@/pages/Auth";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { CategorySection } from "@/components/categories/CategorySection";
import { ContentToggle } from "@/components/content/ContentToggle";
import { MusicSection } from "@/components/content/MusicSection";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionManager } from "@/hooks/useSessionManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GlobalNotification } from "@/components/notifications/GlobalNotification";
import { WelcomeOverlay } from "@/components/welcome/WelcomeOverlay";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";
import { Helmet } from "react-helmet";
import { FetchingIssueAlert } from "@/components/notifications/FetchingIssueAlert";

const MainContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const { data: videos, isLoading, refetch, lastSuccessfulFetch, fetchAttempts } = useVideos();
  const isMobile = useIsMobile();
  const { session } = useSessionManager();

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
      <main className="mt-4 mx-auto px-2 md:px-6 max-w-[1400px]">
        <div className="space-y-2 md:space-y-4">
          <div className="space-y-0">
            <ContentToggle 
              isMusic={isMusic} 
              onToggle={() => setIsMusic(!isMusic)} 
            />
            <CategorySection />
          </div>

          {!isMusic && <FetchingIssueAlert />}

          <motion.div
            key={isMusic ? "music" : "videos"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={isMobile ? 'mt-2' : 'mt-4'}
          >
            {!isMusic ? (
              <VideoContent 
                videos={videos} 
                isLoading={isLoading} 
                refetch={refetch}
                lastSuccessfulFetch={lastSuccessfulFetch}
                fetchAttempts={fetchAttempts}
              />
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
    <>
      <Helmet>
        <title>{getPageTitle('/')}</title>
        <meta name="description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="keywords" content={DEFAULT_META_KEYWORDS} />
        <meta property="og:title" content={getPageTitle('/')} />
        <meta property="og:description" content={DEFAULT_META_DESCRIPTION} />
        <meta property="og:image" content={DEFAULT_META_IMAGE} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle('/')} />
        <meta name="twitter:description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_META_IMAGE} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
        <WelcomeOverlay />
        <WelcomeAnimation />
        <MainContent />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </>
  );
};

export default Index;

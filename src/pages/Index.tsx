import { Header } from "@/components/Header";
import Auth from "@/pages/Auth";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { ContentToggle } from "@/components/content/ContentToggle";
import { MusicSection } from "@/components/content/MusicSection";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionManager } from "@/hooks/useSessionManager";
import { supabase } from "@/integrations/supabase/client";
import { GlobalNotification } from "@/components/notifications/GlobalNotification";
import { WelcomeOverlay } from "@/components/welcome/WelcomeOverlay";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import { SiteDisclaimerBanner } from "@/components/notifications/SiteDisclaimerBanner";
import { useSearchParams } from "react-router-dom";
import { getScrollPosition } from "@/utils/scrollRestoration";

const MainContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const { 
    data: videos, 
    isLoading, 
    refetch, 
    forceRefetch,
    lastSuccessfulFetch, 
    fetchAttempts, 
    error 
  } = useVideos();
  
  const { isMobile } = useIsMobile();
  const { session } = useSessionManager();
  const notificationsProcessedRef = useRef(false);
  const hasMadeInitialFetchAttempt = useRef(false);
  const [searchParams] = useSearchParams();
  const skipWelcome = searchParams.get("skipWelcome") === "true";

  const markNotificationsAsRead = async () => {
    if (!session?.user?.id || notificationsProcessedRef.current) return;

    notificationsProcessedRef.current = true;
    try {
      const { error } = await supabase
        .from("video_notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking notifications as read:", error);
        if (!error.message.includes("recursion") && !error.message.includes("policy")) {
          console.warn("Notifications error suppressed:", error.message);
        }
      }
    } catch (err) {
      console.error("Unexpected error marking notifications as read:", err);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      markNotificationsAsRead();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    return () => {
      notificationsProcessedRef.current = false;
    };
  }, []);

  useEffect(() => {
    console.log(`Main content rendering with ${videos?.length || 0} videos, isLoading: ${isLoading}, isMobile: ${isMobile}`);
    
    if (error) {
      console.error("Error loading videos:", error);
    }
    
    if (videos?.length > 0) {
      console.log("First video sample:", videos[0]);
    }
  }, [videos, isLoading, error, isMobile]);

  useEffect(() => {
    if (!hasMadeInitialFetchAttempt.current) {
      hasMadeInitialFetchAttempt.current = true;
      
      if (!isLoading && 
          (!videos || videos.length === 0 || 
           (videos.length > 0 && videos.some(v => v.id.toString().includes('sample'))))) {
        console.log("Initial mount - forcing video fetch to get real content");
        
        setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error fetching videos on mount:", err);
          });
        }, 100);
      }
    }
  }, [videos, isLoading, forceRefetch]);

  useEffect(() => {
    if (skipWelcome) {
      const savedPosition = getScrollPosition("/" + window.location.search);
      if (savedPosition > 0) {
        setTimeout(() => {
          window.scrollTo({
            top: savedPosition,
            behavior: 'auto'
          });
        }, 100);
      }
    }
  }, [skipWelcome]);

  return (
    <div className="flex-1">
      <Header />
      <GlobalNotification />
      <main className="mt-4 mx-auto px-2 md:px-6 max-w-[1400px]">
        <SiteDisclaimerBanner />
        <div className="space-y-2 md:space-y-4">
          <div className="space-y-0">
            <ContentToggle 
              isMusic={isMusic} 
              onToggle={() => setIsMusic(!isMusic)} 
            />
            {/* Category section removed as requested */}
          </div>

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
                videos={videos || []} 
                isLoading={isLoading} 
                refetch={refetch}
                forceRefetch={forceRefetch}
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
  const [searchParams] = useSearchParams();
  const skipWelcome = searchParams.get("skipWelcome") === "true";

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
        <link rel="icon" href="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" />
      </Helmet>
      
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
        {!skipWelcome && <WelcomeOverlay />}
        {!skipWelcome && <WelcomeAnimation />}
        <MainContent />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </>
  );
};

export default Index;

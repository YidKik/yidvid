
import { Header } from "@/components/Header";
import Auth from "@/pages/Auth";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ContentToggle } from "@/components/content/ContentToggle";
import { MusicSection } from "@/components/content/MusicSection";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionManager } from "@/hooks/useSessionManager";
import { EnhancedWelcomeOverlay } from "@/components/welcome/EnhancedWelcomeOverlay";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";
import { isWelcomePage } from "@/utils/scrollRestoration";

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
  const [searchParams] = useSearchParams();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex-1">
      <Header />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 mx-auto px-2 md:px-6 max-w-[1400px] relative z-10"
      >
        <div className="space-y-2 md:space-y-4">
          <motion.div 
            className="space-y-0"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <ContentToggle 
              isMusic={isMusic} 
              onToggle={() => setIsMusic(!isMusic)} 
            />
          </motion.div>

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
        
        <div className="h-[1500px]"></div>
      </motion.main>

      <motion.div 
        className="fixed bottom-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg z-50"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: hasScrolled ? 1 : 0,
          scale: hasScrolled ? 1 : 0.5,
          y: hasScrolled ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          whileHover={{ scale: 1.2 }}
          className="cursor-pointer text-primary"
        >
          <path d="m18 15-6-6-6 6"/>
        </motion.svg>
      </motion.div>
    </div>
  );
};

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const shouldShowWelcome = !searchParams.get('skipWelcome') && isWelcomePage(window.location.pathname + window.location.search);

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
        {shouldShowWelcome && <EnhancedWelcomeOverlay />}
        <MainContent />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </>
  );
};

export default Index;

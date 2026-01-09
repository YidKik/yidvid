
import { Header } from "@/components/Header";
import Auth from "@/pages/Auth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Helmet } from "react-helmet";
import { SiteMaintenancePopup } from "@/components/SiteMaintenancePopup";
import { FloatingSearchButton } from "@/components/mobile/FloatingSearchButton";
import { ChevronUp, Sparkles } from "lucide-react";

const MainContent = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleVideos, setVisibleVideos] = useState(12);
  
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
  const [hasScrolled, setHasScrolled] = useState(false);

  // Filter and sort videos based on selected category
  const filteredVideos = videos?.filter(video => {
    if (selectedCategory === "all") return true;
    return video.category === selectedCategory;
  }).sort((a, b) => {
    return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
  }) || [];

  const displayVideos = filteredVideos;

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
    setVisibleVideos(12);
  }, [selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 videos-page videos-page-container min-h-screen">
      <Header 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        {/* Hero Section with Welcome Message */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-full bg-gradient-to-r from-white via-rose-50/50 to-white border-b border-gray-100"
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                  {selectedCategory === "all" ? "Discover Videos" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Videos`}
                </h1>
                <p className="text-sm text-gray-500 hidden md:block">
                  Explore our curated collection of kosher content
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 md:py-8">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <VideoContent 
              videos={displayVideos} 
              isLoading={isLoading} 
              refetch={refetch}
              forceRefetch={forceRefetch}
              lastSuccessfulFetch={lastSuccessfulFetch}
              fetchAttempts={fetchAttempts}
            />
          </motion.div>
        </div>
      </motion.main>

      {/* Modern Scroll to Top Button */}
      <AnimatePresence>
        {hasScrolled && !isMobile && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={scrollToTop}
            className="scroll-top-modern"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6 text-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile floating search button */}
      <FloatingSearchButton hasScrolled={hasScrolled} />
    </div>
  );
};

const Videos = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMaintenancePopupOpen, setIsMaintenancePopupOpen] = useState(true);

  return (
    <>
      <Helmet>
        <title>Kosher videos | YidVid kosher content</title>
        <meta name="description" content="YidVid is your premier Jewish kosher Yiddish platform featuring thousands of videos, content from trusted sources." />
        <meta name="keywords" content="Jewish videos, Torah videos, Jewish lectures, Jewish education, Jewish music, Jewish content, Torah study, Jewish learning, Jewish media, kosher videos, Jewish platform, Torah classes, Jewish spirituality, Yiddish videos, chasdesh videos, Jewish youtube, kosher you tube, kosher content, yiddish content" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={`${window.location.origin}/videos`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Kosher videos | YidVid kosher content" />
        <meta property="og:description" content="YidVid is your premier Jewish kosher Yiddish platform featuring thousands of videos, content from trusted sources." />
        <meta property="og:image" content="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/videos`} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kosher videos | YidVid kosher content" />
        <meta name="twitter:description" content="YidVid is your premier Jewish kosher Yiddish platform featuring thousands of videos, content from trusted sources." />
        <meta name="twitter:image" content="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGallery",
            "name": "Kosher Videos Collection",
            "description": "Curated collection of kosher Jewish Yiddish videos and content",
            "url": `${window.location.origin}/videos`,
            "publisher": {
              "@type": "Organization",
              "name": "YidVid",
              "logo": "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen w-full overflow-x-hidden max-w-[100vw]">
        <MainContent />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
        <SiteMaintenancePopup 
          isOpen={isMaintenancePopupOpen} 
          onClose={() => setIsMaintenancePopupOpen(false)} 
        />
      </div>
    </>
  );
};

export default Videos;


import { Header } from "@/components/Header";
import Auth from "@/pages/Auth";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ContentToggle } from "@/components/content/ContentToggle";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";

const MainContent = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleVideos, setVisibleVideos] = useState(12); // Start with 12 videos (3 rows of 4)
  
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

  // Filter and sort videos based on selected category
  const filteredVideos = videos?.filter(video => {
    if (selectedCategory === "all") return true;
    return video.category === selectedCategory;
  }).sort((a, b) => {
    // Sort by uploaded date (latest first)
    return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
  }) || [];

  // Pass all filtered videos to let internal pagination handle display
  const displayVideos = filteredVideos;
  const hasMoreVideos = false; // Remove "Load More" since we'll use pagination arrows

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
    setVisibleVideos(12);
  }, [selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex-1 videos-page">
      <Header 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mt-4 mx-auto px-2 md:px-6 max-w-[1400px]"
      >
        <div className="space-y-2 md:space-y-4">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={isMobile ? 'mt-2' : 'mt-4'}
          >
            <VideoContent 
              videos={displayVideos} 
              isLoading={isLoading} 
              refetch={refetch}
              forceRefetch={forceRefetch}
              lastSuccessfulFetch={lastSuccessfulFetch}
              fetchAttempts={fetchAttempts}
            />
            
            {/* Load More Button */}
            {hasMoreVideos && !isLoading && (
              <motion.div 
                className="flex justify-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => setVisibleVideos(prev => prev + 12)}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Load More Videos
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.main>

      <motion.div 
        className="fixed bottom-4 right-4 p-3 bg-card/80 backdrop-blur-sm rounded-full shadow-lg"
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

const Videos = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
      
      <div className="min-h-screen w-full bg-white videos-page">
        <MainContent />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </>
  );
};

export default Videos;

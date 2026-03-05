
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { usePageLoader } from "@/contexts/LoadingContext";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { Footer } from "@/components/layout/Footer";

const MainContent = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const sortFromUrl = searchParams.get('sort');
  const viewFromUrl = searchParams.get('view');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "all");
  
  const { 
    data: videos, 
    isLoading, 
    refetch, 
    forceRefetch,
    lastSuccessfulFetch, 
    fetchAttempts, 
    isRefreshing
  } = useVideos();
  
  const { isMobile, isTablet } = useIsMobile();
  const { sidebarWidth } = useSidebarContext();
  const [hasScrolled, setHasScrolled] = useState(false);

  usePageLoader('videos', isLoading);

  useEffect(() => {
    const newCategory = categoryFromUrl || "all";
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
    }
  }, [categoryFromUrl]);

  // Memoize filtered+sorted videos to avoid recomputing every render
  const displayVideos = useMemo(() => {
    if (!videos || !Array.isArray(videos)) return [];
    
    let result = videos;
    if (selectedCategory !== "all") {
      result = result.filter(video => video.category === selectedCategory);
    }
    return result;
  }, [videos, selectedCategory]);

  useEffect(() => {
    if (isMobile) return;

    const handleScroll = () => {
      const nextHasScrolled = window.scrollY > 50;
      setHasScrolled((prev) => (prev === nextHasScrolled ? prev : nextHasScrolled));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const hasVideos = videos && Array.isArray(videos) && videos.length > 0;
  if (isLoading && !hasVideos) {
    return null;
  }

  return (
    <div 
      className="flex-1 videos-page pt-14 pb-24 md:pb-24 lg:pb-4"
      style={!isMobile && sidebarWidth ? { paddingLeft: `${sidebarWidth + 16}px` } : undefined}
    >
      <main className="mt-4 px-6 lg:px-8 w-full">
        <div className="space-y-2 md:space-y-4">
          <div className={isMobile ? 'mt-2' : 'mt-4'}>
            <VideoContent 
              videos={displayVideos} 
              isLoading={isLoading} 
              refetch={refetch}
              forceRefetch={forceRefetch}
              lastSuccessfulFetch={lastSuccessfulFetch}
              fetchAttempts={fetchAttempts}
              selectedCategory={selectedCategory}
              sortBy={sortFromUrl || undefined}
              viewChannels={viewFromUrl === 'channels'}
            />
          </div>
        </div>
      </main>

      {/* Desktop/Tablet scroll to top button */}
      {!isMobile && (
        <motion.div 
          className={`fixed ${isTablet ? 'bottom-24' : 'bottom-4'} right-4 p-3 rounded-full cursor-pointer z-40`}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid hsl(50, 100%, 50%)'
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: hasScrolled ? 1 : 0,
            scale: hasScrolled ? 1 : 0.5,
            y: hasScrolled ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1 }}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(50, 100%, 50%)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6"/>
          </motion.svg>
        </motion.div>
      )}
    </div>
  );
};

const Videos = () => {
  return (
    <>
      <Helmet>
        <title>Kosher videos | YidVid kosher content</title>
        <meta name="description" content="YidVid is your premier Jewish kosher Yiddish platform featuring thousands of videos, content from trusted sources." />
        <meta name="keywords" content="Jewish videos, Torah videos, Jewish lectures, Jewish education, Jewish music, Jewish content, Torah study, Jewish learning, Jewish media, kosher videos, Jewish platform, Torah classes, Jewish spirituality, Yiddish videos, chasdesh videos, Jewish youtube, kosher you tube, kosher content, yiddish content" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={`${window.location.origin}/videos`} />
        
        <meta property="og:title" content="Kosher videos | YidVid kosher content" />
        <meta property="og:description" content="YidVid is your premier Jewish kosher Yiddish platform featuring thousands of videos, content from trusted sources." />
        <meta property="og:image" content="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/videos`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kosher videos | YidVid kosher content" />
        <meta name="twitter:description" content="YidVid is your premier Jewish kosher Yiddish platform featuring thousands of videos, content from trusted sources." />
        <meta name="twitter:image" content="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" />
        
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
      
      <div className="min-h-screen w-full bg-white videos-page overflow-x-hidden max-w-[100vw] flex flex-col">
        <div className="flex-1">
          <MainContent />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Videos;

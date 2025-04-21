
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { VideoCarousels } from "@/components/home/VideoCarousels";
import { useVideos } from "@/hooks/video/useVideos";
import { Helmet } from "react-helmet";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";

const WelcomeSection = () => {
  return (
    <div className="py-10 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Welcome to Your Video Experience
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover and enjoy a curated collection of videos from across the web.
          Our platform brings you the best content all in one place.
        </motion.p>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { 
    data: videos, 
    isLoading
  } = useVideos();

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle('home')}</title>
        <meta name="description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="keywords" content={DEFAULT_META_KEYWORDS} />
        <meta property="og:title" content={getPageTitle('home')} />
        <meta property="og:description" content={DEFAULT_META_DESCRIPTION} />
        <meta property="og:image" content={DEFAULT_META_IMAGE} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle('home')} />
        <meta name="twitter:description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_META_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>
      
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <WelcomeSection />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8"
          >
            <VideoCarousels 
              videos={videos || []} 
              isLoading={isLoading} 
              onVideoClick={handleVideoClick}
            />
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default HomePage;

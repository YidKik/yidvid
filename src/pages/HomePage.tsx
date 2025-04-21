
import React from 'react';
import { motion } from 'framer-motion';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { ChannelCarousels } from '@/components/home/ChannelCarousels';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { useShuffledVideos } from '@/hooks/video/useShuffledVideos';
import { HeroParallax } from '@/components/ui/hero-parallax';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels, isLoading: channelsLoading } = useChannelsGrid();
  const shuffledVideos = useShuffledVideos(videos);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.2 
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen w-full overflow-x-hidden bg-[#030303]"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Hero Section with Content */}
      <div className="relative min-h-[150vh]">
        {/* Content Overlay - Moved higher */}
        <div className="fixed top-20 left-0 right-0 z-20 flex flex-col items-center justify-start px-4 text-center">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
              alt="YidVid Logo" 
              className="h-48 w-auto mx-auto"
            />
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              Your Gateway to
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary">
              Jewish Content
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl">
            Watch, share, and connect with the finest Jewish content from around the world.
          </p>

          <Link to="/videos">
            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors">
              Explore Videos
            </button>
          </Link>
        </div>

        {/* Video Background - Moved down */}
        {videos && videos.length > 15 && (
          <div className="absolute top-[30vh] inset-x-0 h-[120vh]">
            <HeroParallax 
              videos={videos} 
              title="" 
              description=""
            />
          </div>
        )}
      </div>

      <motion.section className="py-4 relative z-10">
        <ChannelCarousels isLoading={channelsLoading} />
      </motion.section>
    </motion.div>
  );
};

export default HomePage;


import React from 'react';
import { motion } from 'framer-motion';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { ChannelCarousels } from '@/components/home/ChannelCarousels';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { useShuffledVideos } from '@/hooks/video/useShuffledVideos';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import { HeroParallax } from '@/components/ui/hero-parallax';

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
      className="min-h-screen w-full overflow-x-hidden bg-white"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <div className="relative h-screen">
        {videos && videos.length > 15 && (
          <div className="absolute inset-0 w-full h-full">
            <HeroParallax 
              videos={videos} 
              title="" 
              description=""
            />
          </div>
        )}
        
        <div className="relative z-10">
          <HeroGeometric 
            badge="YidVid"
            title1="Your Gateway to"
            title2="Jewish Content"
            channels={manuallyFetchedChannels}
          />
        </div>
      </div>

      <motion.section className="py-4 relative">
        <ChannelCarousels isLoading={channelsLoading} />
      </motion.section>
    </motion.div>
  );
};

export default HomePage;


import React from 'react';
import { motion } from 'framer-motion';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { ChannelCarousels } from '@/components/home/ChannelCarousels';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { AnimatedVideoHero } from '@/components/home/AnimatedVideoHero';
import { TiltedVideoScroll } from '@/components/home/TiltedVideoScroll';

const HomePage = () => {
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels, isLoading: channelsLoading } = useChannelsGrid();

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
      {/* Animated Hero Section with Videos */}
      {videos && <AnimatedVideoHero videos={videos} />}

      {/* Tilted Video Scroll */}
      <motion.section className="py-8 relative">
        {videos && <TiltedVideoScroll videos={videos} />}
      </motion.section>

      {/* Channel Avatars Scrolling */}
      <motion.section className="py-4 relative">
        <ChannelCarousels isLoading={channelsLoading} />
      </motion.section>
    </motion.div>
  );
};

export default HomePage;

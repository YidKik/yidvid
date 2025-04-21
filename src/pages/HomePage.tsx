import React from 'react';
import { motion } from 'framer-motion';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { ChannelCarousels } from '@/components/home/ChannelCarousels';
import { TiltedVideoScroll } from '@/components/home/TiltedVideoScroll';
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
      className="min-h-screen w-full overflow-x-hidden bg-[#030303]"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <HeroGeometric 
        badge="YidVid"
        title1="Your Gateway to"
        title2="Jewish Content"
        channels={manuallyFetchedChannels}
      />

      {videos && videos.length > 15 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full"
        >
          <HeroParallax 
            videos={videos} 
            title="" 
            description=""
          />
        </motion.section>
      )}

      <div className="space-y-2 mt-4">
        {videos && (
          <motion.section 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TiltedVideoScroll videos={videos} />
          </motion.section>
        )}

        {shuffledVideos && (
          <motion.section 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TiltedVideoScroll videos={shuffledVideos} reverse={true} />
          </motion.section>
        )}
      </div>

      <motion.section className="py-4 relative">
        <ChannelCarousels isLoading={channelsLoading} />
      </motion.section>
    </motion.div>
  );
};

export default HomePage;

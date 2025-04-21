
import React from 'react';
import { motion } from 'framer-motion';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { ChannelCarousels } from '@/components/home/ChannelCarousels';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { AnimatedVideoHero } from '@/components/home/AnimatedVideoHero';
import { TiltedVideoScroll } from '@/components/home/TiltedVideoScroll';
import { useShuffledVideos } from '@/hooks/video/useShuffledVideos';
import { WelcomeSection } from '@/components/home/WelcomeSection';

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
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Video Scroll Sections - Closer Together */}
      <div className="space-y-2 mt-4">
        {/* First Tilted Video Scroll Section - Right to Left */}
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

        {/* Second Tilted Video Scroll Section - Left to Right */}
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

      {/* Channel Avatars Scrolling */}
      <motion.section className="py-4 relative">
        <ChannelCarousels isLoading={channelsLoading} />
      </motion.section>
    </motion.div>
  );
};

export default HomePage;


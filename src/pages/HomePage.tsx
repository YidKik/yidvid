
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { ChannelCarousels } from '@/components/home/ChannelCarousels';
import { HomeHero } from '@/components/home/HomeHero';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';

const HomePage = () => {
  const navigate = useNavigate();
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels, isLoading: channelsLoading } = useChannelsGrid();

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

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

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-gray-50 to-white"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Hero Section */}
      <motion.section 
        className="pt-10 pb-6 md:pb-12"
        variants={itemVariants}
      >
        <HomeHero />
      </motion.section>

      {/* Channel Avatars Scrolling */}
      <motion.section 
        className="py-4 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-white before:via-transparent before:to-white before:z-10 overflow-hidden"
        variants={itemVariants}
      >
        <div className="relative z-0">
          <ChannelCarousels isLoading={channelsLoading} />
        </div>
      </motion.section>

      {/* Video Carousels */}
      <motion.section
        className="py-4 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-white before:via-transparent before:to-white before:z-10 overflow-hidden"
        variants={itemVariants}
      >
        <div className="relative z-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 px-6 md:px-16">Discover Videos</h2>
          <VideoCarousels 
            videos={videos || []} 
            isLoading={videosLoading} 
            onVideoClick={handleVideoClick}
          />
        </div>
      </motion.section>

      {/* Call-to-Action Section */}
      <motion.section 
        className="py-12 md:py-16 px-6"
        variants={itemVariants}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Ready to Explore?</h2>
          <p className="text-xl text-gray-600 mb-8">Discover inspiring videos from our curated selection</p>
          <motion.button
            className="bg-[#ea384c] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#d6293d] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/videos')}
          >
            Browse All Videos
          </motion.button>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default HomePage;

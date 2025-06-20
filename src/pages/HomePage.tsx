
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { HeroParallax } from '@/components/ui/hero-parallax';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { MainHeroSection } from '@/components/home/MainHeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AnimatedGridSection } from '@/components/home/AnimatedGridSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeedbackSection } from '@/components/home/FeedbackSection';
import { Footer } from '@/components/home/Footer';
import { useHomeAnimations } from '@/hooks/useHomeAnimations';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomeSection } from '@/components/home/MobileHomeSection';
import { usePrefetchData } from '@/hooks/usePrefetchData';

const HomePage = () => {
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels, isLoading: channelsLoading } = useChannelsGrid();
  const channelsSectionRef = useRef(null);
  const { isMobile, isTablet } = useIsMobile();
  const showHeroParallax = !isMobile && !isTablet;

  // Prefetch videos and channels for faster navigation to videos page
  usePrefetchData();

  useHomeAnimations(channelsSectionRef);

  // Add class to body on mount, remove on unmount
  useEffect(() => {
    document.body.classList.add('home-page');
    
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  const channelItems = manuallyFetchedChannels?.map(channel => 
    channel.thumbnail_url || 'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d'
  ) || [];

  const extendedChannelItems = [...channelItems, ...channelItems].slice(0, 30);

  // Return the blank mobile section for mobile and tablet views
  if (isMobile || isTablet) {
    return <MobileHomeSection />;
  }

  // Only desktop views will see the full content
  return (
    <motion.div 
      className="min-h-screen w-full overflow-x-hidden relative bg-[#003c43]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BackgroundGradientAnimation 
        interactive={false}
        gradientBackgroundStart="#003c43"
        gradientBackgroundEnd="#003c43"
        firstColor="119, 176, 170"
        secondColor="119, 176, 170"
        thirdColor="255, 255, 255"
        fourthColor="119, 176, 170"
        fifthColor="255, 255, 255"
        blendingValue="soft-light"
        containerClassName="fixed inset-0 z-0"
      />

      <div className="relative z-10 w-full">
        <div className="relative min-h-[80vh] px-4">
          <MainHeroSection />
          
          {showHeroParallax && videos && videos.length > 8 && (
            <div className="absolute top-[15vh] inset-x-0 hero-parallax-section z-10">
              <HeroParallax 
                videos={videos}
                title=""
                description=""
              />
            </div>
          )}
        </div>

        <FeaturesSection />
        <AnimatedGridSection channelItems={extendedChannelItems} />
        <StatsSection />
        <FeedbackSection />
        <Footer />
      </div>
    </motion.div>
  );
};

export default HomePage;

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { HeroParallax } from '@/components/ui/hero-parallax';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { MainHeroSection } from '@/components/home/MainHeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AnimatedGridSection } from '@/components/home/AnimatedGridSection';
import { useHomeAnimations } from '@/hooks/useHomeAnimations';
import { useIsMobile } from '@/hooks/use-mobile';

const HomePage = () => {
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels, isLoading: channelsLoading } = useChannelsGrid();
  const channelsSectionRef = useRef(null);
  const { isMobile, isTablet } = useIsMobile();
  const showHeroParallax = !isMobile && !isTablet;

  useHomeAnimations(channelsSectionRef);

  const channelItems = manuallyFetchedChannels?.map(channel => 
    channel.thumbnail_url || 'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d'
  ) || [];

  const extendedChannelItems = [...channelItems, ...channelItems].slice(0, 30);

  return (
    <motion.div 
      className="min-h-screen w-full overflow-x-hidden relative"
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

          <div className="sm:hidden">
            {/* You can provide the new mobile design here later */}
          </div>

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
      </div>
    </motion.div>
  );
};

export default HomePage;

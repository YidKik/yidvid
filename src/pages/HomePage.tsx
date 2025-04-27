
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { HeroParallax } from '@/components/ui/hero-parallax';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { MainHeroSection } from '@/components/home/MainHeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AnimatedGridSection } from '@/components/home/AnimatedGridSection';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels, isLoading: channelsLoading } = useChannelsGrid();
  const channelsSectionRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';

    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        scrollTrigger: {
          trigger: heroContent,
          start: 'top top',
          end: '+=300',
          scrub: 0.5,
        },
        y: -100,
        opacity: 0,
        ease: 'power2.inOut',
      });
    }

    if (channelsSectionRef.current) {
      gsap.fromTo(
        channelsSectionRef.current,
        { 
          y: 100,
          opacity: 0 
        },
        {
          scrollTrigger: {
            trigger: '.hero-parallax-section',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
          y: 0,
          opacity: 1,
          ease: 'power2.out',
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

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
        gradientBackgroundStart="#030303"
        gradientBackgroundEnd="#1a0000"
        firstColor="234, 56, 76"
        secondColor="234, 56, 76"
        thirdColor="255, 255, 255"
        fourthColor="234, 56, 76"
        fifthColor="255, 255, 255"
        blendingValue="soft-light"
        containerClassName="fixed inset-0 z-0"
      />

      <div className="relative z-10 w-full">
        <div className="relative min-h-[100vh] px-4 sm:px-6">
          <MainHeroSection />

          {videos && videos.length > 8 && (
            <div className="absolute top-[30vh] sm:top-[36vh] inset-x-0 hero-parallax-section z-10">
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

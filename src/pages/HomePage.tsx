
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { HeroParallax } from '@/components/ui/hero-parallax';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GridMotion } from '@/components/ui/grid-motion';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels, isLoading: channelsLoading } = useChannelsGrid();
  const channelsSectionRef = useRef(null);

  useEffect(() => {
    // Animate hero content on first scroll
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

    // Link channels section animation to the hero content
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
      // Clean up all scroll triggers on unmount
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const channelItems = manuallyFetchedChannels?.map(channel => 
    channel.thumbnail_url || 'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d'
  ) || [];

  const extendedChannelItems = [...channelItems, ...channelItems, ...channelItems, ...channelItems].slice(0, 200);

  return (
    <motion.div 
      className="min-h-screen w-full overflow-x-hidden bg-[#030303]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section with Content */}
      <div className="relative min-h-[100vh]">
        {/* Content Overlay */}
        <div className="fixed top-10 left-0 right-0 z-20 flex flex-col items-center justify-start px-4 text-center hero-content">
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-6">
              <img 
                src="/lovable-uploads/dd4fbfcb-aeb9-4cd3-a7b1-9dbf07b81a43.png" 
                alt="YidVid Icon" 
                className="w-40 h-40 object-contain"
              />
              <h2 className="text-7xl sm:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary">
                YidVid
              </h2>
            </div>
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

        {/* Video Background */}
        {videos && videos.length > 15 && (
          <div className="absolute top-[20vh] inset-x-0 h-[100vh] hero-parallax-section">
            <HeroParallax 
              videos={videos} 
              title="" 
              description=""
            />
          </div>
        )}
      </div>

      {/* Channels Grid Section */}
      <motion.section 
        ref={channelsSectionRef}
        className="relative z-10 w-full mt-[130vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="w-full px-0 py-40">
          <h2 className="text-white text-2xl font-bold text-center mb-8">Featured Channels</h2>
          <div className="w-full h-[700px] overflow-visible">
            <GridMotion 
              items={extendedChannelItems}
              gradientColor="#ea384c"
              className="relative z-10 w-full h-full opacity-90"
            />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default HomePage;

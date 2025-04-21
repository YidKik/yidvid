import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
  const videoSectionRef = useRef(null);
  const channelsSectionRef = useRef(null);
  const isChannelsInView = useInView(channelsSectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    // Animate hero content on scroll
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        scrollTrigger: {
          trigger: heroContent,
          start: 'top top',
          end: '+=300',
          scrub: 1,
        },
        y: -100,
        opacity: 0,
      });
    }

    // Add scroll trigger for channels section to appear after videos
    if (channelsSectionRef.current) {
      gsap.fromTo(
        channelsSectionRef.current,
        { 
          y: 100, 
          opacity: 0
        },
        {
          scrollTrigger: {
            trigger: channelsSectionRef.current,
            start: 'top bottom',
            end: 'top center',
            scrub: 1,
          },
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 1
        }
      );
    }
  }, []);

  // Transform channel data for GridMotion with smaller circles
  const channelItems = manuallyFetchedChannels?.map(channel => 
    channel.thumbnail_url || 'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d'
  ) || [];

  // Add more items to create additional rows (increased from 84 to 126 for more circles)
  const extendedChannelItems = [...channelItems, ...channelItems, ...channelItems, ...channelItems].slice(0, 126);

  return (
    <motion.div 
      className="min-h-screen w-full overflow-x-hidden bg-[#030303]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section with Content */}
      <div className="relative min-h-[120vh]">
        {/* Content Overlay */}
        <div className="fixed top-10 left-0 right-0 z-20 flex flex-col items-center justify-start px-4 text-center hero-content">
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

        {/* Video Background */}
        {videos && videos.length > 15 && (
          <div className="absolute top-[40vh] inset-x-0 h-[100vh]">
            <HeroParallax 
              videos={videos} 
              title="" 
              description=""
            />
          </div>
        )}
      </div>

      {/* Channels Section with GridMotion - Smaller circles */}
      <motion.section 
        ref={channelsSectionRef} 
        className="relative z-10 mt-[20vh]"
      >
        <div className="min-h-screen py-20">
          <GridMotion 
            items={extendedChannelItems}
            gradientColor="#ea384c"
            className="relative z-10 opacity-90 channel-grid transform scale-50"
          />
        </div>
      </motion.section>
    </motion.div>
  );
};

export default HomePage;

import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { VideoCarousels } from '@/components/home/VideoCarousels';
import { ChannelCarousels } from '@/components/home/ChannelCarousels';
import { useVideos } from '@/hooks/video/useVideos';
import { useChannelsGrid } from '@/hooks/channel/useChannelsGrid';
import { useShuffledVideos } from '@/hooks/video/useShuffledVideos';
import { HeroParallax } from '@/components/ui/hero-parallax';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GridMotion } from '@/components/ui/grid-motion';
import { ChannelCard } from '@/components/youtube/grid/ChannelCard';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { manuallyFetchedChannels, isLoading: channelsLoading } = useChannelsGrid();
  const shuffledVideos = useShuffledVideos(videos);
  const videoSectionRef = useRef(null);
  const extraChannelSectionRef = useRef(null);
  const isExtraChannelsInView = useInView(extraChannelSectionRef, { once: true, amount: 0.2 });

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

    // Animate video section fade out when channel section comes in
    if (videoSectionRef.current && extraChannelSectionRef.current) {
      gsap.to(videoSectionRef.current, {
        scrollTrigger: {
          trigger: extraChannelSectionRef.current,
          start: 'top bottom',
          end: 'top center',
          scrub: 1,
        },
        y: -50,
        opacity: 0,
        ease: 'power2.inOut',
      });
    }

    // Add scroll trigger for extra channel section
    if (extraChannelSectionRef.current) {
      gsap.fromTo(
        extraChannelSectionRef.current,
        { 
          x: -1000, 
          opacity: 0,
          rotate: -5
        },
        {
          scrollTrigger: {
            trigger: extraChannelSectionRef.current,
            start: 'top bottom',
            end: 'top center',
            scrub: 1,
          },
          x: 0,
          opacity: 1,
          rotate: 0,
          ease: 'power2.out',
          duration: 1.5
        }
      );
    }
  }, []);

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

  // Transform channel data for GridMotion
  const channelItems = manuallyFetchedChannels?.map(channel => 
    channel.thumbnail_url || 'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d'
  ) || [];

  return (
    <motion.div 
      className="min-h-screen w-full overflow-x-hidden bg-[#030303]"
      variants={pageVariants}
      initial="initial"
      animate="animate"
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

      {/* Video Background Section with fade out animation */}
      <motion.section 
        ref={videoSectionRef}
        className="relative z-10 mb-20"
      >
        {videos && videos.length > 15 && (
          <div className="absolute top-[40vh] inset-x-0 h-[100vh]">
            <HeroParallax 
              videos={videos} 
              title="" 
              description=""
            />
          </div>
        )}
      </motion.section>

      {/* Channels Section with GridMotion - Now with full circular images */}
      <motion.section className="relative z-10 mt-[40vh]">
        <div className="min-h-screen py-20"> 
          <GridMotion 
            items={[...channelItems, ...channelItems, ...channelItems, ...channelItems].slice(0, 70)} 
            gradientColor="#ea384c"
            className="relative z-10 opacity-90 channel-grid"
          />
        </div>
      </motion.section>

      {/* Additional Channel Rows that slide in from left */}
      <div 
        ref={extraChannelSectionRef}
        className="relative z-10 py-16 bg-gradient-to-b from-[#030303] to-[#0a0a0a] overflow-hidden"
      >
        <motion.div 
          className="container mx-auto"
          initial={{ x: "-100%", opacity: 0 }}
          animate={isExtraChannelsInView ? { x: 0, opacity: 1 } : { x: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold mb-8 text-white/90 ml-4">Popular Channels</h2>
          
          {/* Four rows of channels */}
          {[0, 1, 2, 3].map((rowIndex) => (
            <div 
              key={rowIndex}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10"
            >
              {manuallyFetchedChannels?.slice(rowIndex * 7, (rowIndex + 1) * 7).map((channel, index) => (
                <ChannelCard 
                  key={channel.id || index}
                  channel={channel}
                  index={index + (rowIndex * 7)}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;

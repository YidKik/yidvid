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
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

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
        <div className="relative min-h-[100vh]">
          <div className="fixed top-10 left-0 right-0 z-20 flex flex-col items-center justify-start px-4 text-center hero-content">
            <div className="mb-16">
              <div className="flex items-center gap-6 mb-8">
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
            
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold mb-8 md:mb-10 tracking-tight max-w-6xl mx-auto text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                Your Gateway to
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary">
                Jewish Content
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/40 mb-12 leading-relaxed font-light tracking-wide max-w-2xl mx-auto text-center">
              Watch, share, and connect with the finest Jewish content from around the world.
            </p>

            <Link to="/videos">
              <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white text-lg font-medium rounded-lg transition-colors mx-auto">
                Explore Videos
              </button>
            </Link>
          </div>

          {videos && videos.length > 8 && (
            <div className="absolute top-[36vh] inset-x-0 hero-parallax-section z-10">
              <HeroParallax 
                videos={videos}
                title=""
                description=""
              />
            </div>
          )}
        </div>

        <motion.section 
          ref={channelsSectionRef}
          className="relative z-10 w-full mt-[180vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="container mx-auto px-6 py-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: "Free",
                  description: "It doesn't cost anything to make an account and it doesn't cost anything to use it."
                },
                {
                  title: "Kosher",
                  description: "We are on our guidelines to make sure it's 100 percent kosher"
                },
                {
                  title: "Up to date",
                  description: "Keeping the site up to date with every video that meets our guidelines"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={feature.title}
                  className="rounded-3xl border-2 border-[#70a9a4] bg-[#135d66] h-64 flex flex-col items-center justify-center px-8 py-10 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <h3 className="text-4xl font-display text-[#e3fef7] mb-6">{feature.title}</h3>
                  <p className="text-[#77b0aa] text-base leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="relative z-10 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="w-full px-0 py-20">
            <div className="w-full h-[200px] overflow-visible">
              <GridMotion 
                items={extendedChannelItems}
                className="relative z-10 w-full h-full opacity-70"
              />
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default HomePage;

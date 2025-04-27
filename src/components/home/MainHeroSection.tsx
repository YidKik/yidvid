
import React from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

interface MainHeroSectionProps {
  fadeUpVariants?: {
    hidden: object;
    visible: (i: number) => object;
  };
}

export const MainHeroSection: React.FC<MainHeroSectionProps> = () => {
  return (
    <div className="fixed top-4 sm:top-10 left-0 right-0 z-20 flex flex-col items-center justify-start px-4 text-center hero-content">
      <div className="mb-8 sm:mb-16">
        <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-8">
          <img 
            src="/lovable-uploads/dd4fbfcb-aeb9-4cd3-a7b1-9dbf07b81a43.png" 
            alt="YidVid Icon" 
            className="w-20 h-20 sm:w-40 sm:h-40 object-contain"
          />
          <h2 className="text-4xl sm:text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary">
            YidVid
          </h2>
        </div>
      </div>
      
      <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-bold mb-6 sm:mb-8 md:mb-10 tracking-tight max-w-6xl mx-auto text-center px-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
          Your Gateway to
        </span>
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary">
          Jewish Content
        </span>
      </h1>
      
      <p className="text-base sm:text-lg md:text-2xl text-white/40 mb-8 sm:mb-12 leading-relaxed font-light tracking-wide max-w-2xl mx-auto text-center px-4">
        Watch, share, and connect with the finest Jewish content from around the world.
      </p>

      <Link to="/videos">
        <button className="px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 text-white text-base sm:text-lg font-medium rounded-lg transition-colors mx-auto">
          Explore Videos
        </button>
      </Link>
    </div>
  );
};


import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const MainHeroSection: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex flex-col items-center justify-start px-4 text-center hero-content">
      {/* Logo and Title Section */}
      <div className="w-full flex items-center justify-between mb-4 sm:mb-8 pt-4">
        <img 
          src="/lovable-uploads/dd4fbfcb-aeb9-4cd3-a7b1-9dbf07b81a43.png" 
          alt="YidVid Icon" 
          className="w-12 h-12 sm:w-40 sm:h-40 object-contain"
        />
        <nav className="hidden sm:flex space-x-6 text-white/80">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/about" className="hover:text-white">About</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
        </nav>
        <Link to="/signin" className="text-white/80 hover:text-white">
          Sign In
        </Link>
      </div>
      
      <div className="mt-12 sm:mt-20">
        <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4 sm:mb-8 tracking-tight max-w-6xl mx-auto text-center px-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
            Your Gateway to
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary">
            Jewish Content
          </span>
        </h1>
        
        <p className="text-sm sm:text-lg md:text-xl text-white/40 mb-6 sm:mb-8 leading-relaxed font-light tracking-wide max-w-2xl mx-auto text-center px-4">
          Watch, share, and connect with the finest Jewish content from around the world.
        </p>

        <Link to="/videos">
          <motion.button 
            className="px-8 py-2 sm:px-8 sm:py-4 bg-[#003c43] hover:bg-[#135d66] text-white text-lg sm:text-xl font-medium rounded-full transition-colors mx-auto border-2 border-[#77b0aa]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explorer
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

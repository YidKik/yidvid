
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const MainHeroSection: React.FC = () => {
  return (
    <div className="hidden sm:flex fixed top-0 left-0 right-0 z-20 flex-col items-center justify-start px-4 text-center hero-content">
      {/* Logo and Navigation Section */}
      <div className="w-full flex items-center justify-between mb-8 pt-4">
        <img 
          src="/lovable-uploads/dd4fbfcb-aeb9-4cd3-a7b1-9dbf07b81a43.png" 
          alt="YidVid Icon" 
          className="w-40 h-40 object-contain"
        />
        <nav className="flex space-x-6 text-white/80">
          <Link to="/" className="hover:text-white bg-transparent">Home</Link>
          <Link to="/about" className="hover:text-white bg-transparent">About</Link>
          <Link to="/contact" className="hover:text-white bg-transparent">Contact</Link>
        </nav>
        <Link to="/signin" className="text-white/80 hover:text-white bg-transparent">
          Sign In
        </Link>
      </div>
      
      {/* Hero Content */}
      <div className="mt-20 w-full max-w-6xl mx-auto">
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#e3fef7] to-[#e3fef7]/80 inline">
            Your Gateway to
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#77b0aa] via-[#e3fef7] to-[#77b0aa] inline">
            Jewish Content
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-[#77b0aa] mb-10 font-light tracking-wide max-w-2xl mx-auto text-center">
          Watch, share, and connect with the finest Jewish content from around the world.
        </p>

        <Link to="/videos">
          <motion.button 
            className="px-8 py-4 bg-[#003c43] hover:bg-[#135d66] text-[#e3fef7] text-xl font-medium rounded-full transition-colors border-2 border-[#77b0aa]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

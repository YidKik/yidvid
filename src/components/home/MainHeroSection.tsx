
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const MainHeroSection: React.FC = () => {
  return (
    <div className="hidden sm:flex fixed top-0 left-0 right-0 z-10 flex-col items-center justify-start px-4 text-center hero-content pt-24">
      
      {/* Hero Content */}
      <div className="mt-16 w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-block mb-6"
        >
          <span className="px-5 py-2 rounded-full border border-[#77b0aa]/40 bg-[#135d66]/30 text-[#77b0aa] text-sm font-medium tracking-widest uppercase backdrop-blur-sm">
            ✡ Curated Jewish Content
          </span>
        </motion.div>

        <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight text-center">
          <motion.span 
            className="bg-clip-text text-transparent bg-gradient-to-b from-[#e3fef7] to-[#e3fef7]/80 inline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Your Gateway to
          </motion.span>
          <br />
          <motion.span 
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#77b0aa] via-[#e3fef7] to-[#77b0aa] inline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Jewish Content
          </motion.span>
        </h1>
        
        <motion.p 
          className="text-lg md:text-xl text-[#77b0aa] mb-10 font-light tracking-wide max-w-2xl mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Watch, share, and connect with the finest Jewish content from around the world.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Link to="/videos">
            <motion.button 
              className="px-10 py-4 bg-gradient-to-r from-[#135d66] to-[#0e4a52] hover:from-[#1a7a85] hover:to-[#135d66] text-[#e3fef7] text-xl font-medium rounded-full transition-all duration-300 border border-[#77b0aa]/50 shadow-[0_0_30px_rgba(119,176,170,0.15)] hover:shadow-[0_0_40px_rgba(119,176,170,0.3)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Videos
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

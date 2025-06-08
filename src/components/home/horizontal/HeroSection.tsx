
import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center text-center px-8 flex-shrink-0">
      <motion.h1 
        className="text-6xl md:text-7xl lg:text-8xl font-bold text-[#e3fef7] leading-tight mb-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        Your Gateway to<br />
        <span className="whitespace-nowrap">Jewish Content</span>
      </motion.h1>
      
      <motion.p 
        className="text-xl md:text-2xl text-[#77b0aa] max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Watch, share, and connect with the finest Jewish content from around the world.
      </motion.p>
    </div>
  );
};

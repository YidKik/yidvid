
import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { fadeInVariants } from './animation-utils';

export const MobileHeroSection = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      id="home-section"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center space-y-6 pt-24"
    >
      <h1 className="text-4xl sm:text-5xl font-bold text-[#e3fef7] leading-tight flex flex-col">
        <span>Your Getaway to</span>
        <span className="whitespace-nowrap">Jewish Content</span>
      </h1>
      <p className="text-lg text-[#77b0aa] px-4">
        Watch, share, and connect with the finest Jewish content from around the world.
      </p>
      <button 
        onClick={() => navigate('/videos')}
        className="px-8 py-3 bg-[#135d66] border border-[#ddf9f2] text-[#e3fef7] rounded-full text-base hover:bg-[#e3fef7] hover:text-[#135d66] active:bg-[#e3fef7] active:text-[#135d66] transition-colors duration-300 home-button"
      >
        Explore
      </button>
    </motion.div>
  );
};

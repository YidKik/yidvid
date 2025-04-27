
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

export const MobileHeroSection = () => {
  return (
    <motion.div 
      id="home-section"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center space-y-6 pt-24"
    >
      <h1 className="text-5xl font-bold text-[#e3fef7] leading-tight">
        Your Getaway to Jewish Content
      </h1>
      <p className="text-lg text-[#77b0aa] px-4">
        Watch, share, and connect with the finest Jewish content from around the world.
      </p>
      <Link 
        to="/explore"
        className="px-8 py-3 bg-[#135d66] border border-[#ddf9f2] text-[#e3fef7] rounded-full text-base hover:bg-[#135d66]/90 transition-colors duration-300"
      >
        Explore
      </Link>
    </motion.div>
  );
};

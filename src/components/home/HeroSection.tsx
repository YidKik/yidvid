
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="container mx-auto px-6 py-24 grid grid-cols-2 gap-8">
      <motion.div 
        className="space-y-10 flex flex-col items-start justify-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-7xl font-sans font-bold text-white leading-tight">
          Your Gateway to<br />Jewish Content
        </h1>
        <p className="text-[#77b0aa] text-xl leading-relaxed max-w-xl">
          Watch, share, and connect with the finest Jewish content from around the world.
        </p>
        <Link 
          to="/videos"
          className="inline-flex items-center justify-center px-12 py-4 bg-transparent border-2 border-brand-light text-[#77b0aa] text-xl rounded-full hover:bg-[#e3fef7] hover:text-brand-darkest transition-all duration-300"
        >
          Explore
        </Link>
      </motion.div>
      <div className="rounded-3xl border-2 border-brand-light bg-brand-dark/30 p-4">
        <div className="w-full h-full rounded-2xl bg-brand-dark/50 flex items-center justify-center text-white">
          videos page pic
        </div>
      </div>
    </section>
  );
};

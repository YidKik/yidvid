
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlowingEffect } from '@/components/ui/glowing-effect';

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
          className="inline-flex items-center justify-center px-12 py-4 bg-transparent border-2 border-brand-light text-[#77b0aa] text-xl rounded-full hover:bg-[#e3fef7] hover:text-[#135d66] transition-all duration-300"
        >
          Explore
        </Link>
      </motion.div>
      
      {/* Updated image with Link and glowing effect */}
      <motion.div 
        className="flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <Link 
          to="/videos" 
          className="relative w-full h-full transform transition-all duration-700 hover:scale-[1.03] cursor-pointer rounded-3xl"
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl">
            <img 
              src="/lovable-uploads/1daf0100-84f7-491c-b2d1-cd5e363cbd17.png" 
              alt="Collection of Jewish content videos" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0">
              <GlowingEffect
                disabled={false}
                spread={30}
                blur={0}
                proximity={80}
                inactiveZone={0.1}
                movementDuration={1.5}
              />
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
};

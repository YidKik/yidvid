
import React from "react";
import { motion } from "framer-motion";

export const HomeHero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 max-w-7xl mx-auto">
      {/* Left content */}
      <motion.div 
        className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <img
          src="/lovable-uploads/e3f1c50b-8945-4b12-977d-c47c9d1c7083.png"
          alt="YidVid Logo"
          className="w-44 md:w-52 h-auto mb-5 mx-auto md:mx-0"
          draggable={false}
        />

        {/* Welcome and Text */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <span className="text-[#ea384c]">Welcome to YidVid</span>
        </h1>
        <div className="text-xl md:text-2xl text-gray-700 max-w-xl mb-2">
          Your gateway to curated Jewish content.
        </div>
        <p className="text-lg text-gray-600 opacity-80 mb-6 max-w-lg">
          Discover videos that inspire, entertain, and connect.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <motion.button
            className="bg-[#ea384c] text-white px-6 py-3 rounded-full font-medium shadow-md hover:bg-[#e3fef7] hover:text-[#135d66] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Videos
          </motion.button>
          <motion.button
            className="bg-white text-[#ea384c] border border-[#ea384c] px-6 py-3 rounded-full font-medium shadow-md hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse Channels
          </motion.button>
        </div>
      </motion.div>
      
      {/* Right image/animation */}
      <motion.div 
        className="w-full md:w-1/2 flex justify-center md:justify-end"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ea384c]/10 to-purple-500/10 rounded-3xl transform rotate-3"></div>
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden p-2">
            <img 
              src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" 
              alt="Video content preview" 
              className="w-full h-auto rounded-xl"
              draggable={false}
            />
            
            {/* Floating elements */}
            <motion.div 
              className="absolute -top-4 -right-4 bg-[#ea384c] text-white p-3 rounded-full shadow-lg"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export const WelcomeSection = () => {
  const { isMobile } = useIsMobile();

  console.log("WelcomeSection rendering, isMobile:", isMobile);

  return (
    <motion.div 
      className={`${isMobile ? "w-full py-12" : "w-1/2 pr-6"} flex items-center justify-center relative z-10`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" alt="YidVid Logo" className="h-16" />
        </div>
        
        {/* Welcome text */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Welcome to <span className="text-[#ea384c]">YidVid</span>
        </h1>
        
        <p className="text-xl text-gray-700 mb-6 text-center">
          Your gateway to curated Jewish content.
          <br />
          Discover videos that inspire, entertain, and connect.
        </p>
        
        {/* Button */}
        <div className="flex justify-center">
          <a 
            href="/videos" 
            className="px-6 py-3 bg-[#ea384c] text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            Explore Videos
          </a>
        </div>
      </div>
      
      {/* Gradient fade overlay for transition between sections */}
      <div className={`absolute ${isMobile ? "bottom-0 left-0 w-full h-24" : "top-0 right-0 h-full w-24"} pointer-events-none`}>
        <div 
          className={`w-full h-full ${
            isMobile 
              ? "bg-gradient-to-t from-[#f1f1f7] to-transparent" 
              : "bg-gradient-to-r from-transparent to-[#f1f1f7]"
          }`}
        />
      </div>
    </motion.div>
  );
};

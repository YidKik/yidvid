
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export const WelcomeSection = () => {
  const { isMobile } = useIsMobile();

  console.log("WelcomeSection rendering, isMobile:", isMobile);

  return (
    <motion.div 
      className="w-full flex items-center justify-center relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-md mx-auto px-6 text-center">
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
        
        {/* Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <a 
            href="/videos" 
            className="px-6 py-3 bg-[#ea384c] text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            Explore Videos
          </a>
          <a 
            href="/channel" 
            className="px-6 py-3 border border-[#ea384c] text-[#ea384c] font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Browse Channels
          </a>
        </div>
      </div>
    </motion.div>
  );
};

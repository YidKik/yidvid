
import React from "react";
import { motion } from "framer-motion";

export const WelcomeHeader: React.FC = () => {
  return (
    <motion.div 
      className="flex flex-col items-start max-w-lg"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Logo and site name */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
          alt="YidVid Logo"
          className="h-16 md:h-20 w-auto drop-shadow-lg"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          YidVid
        </h1>
      </div>
      
      {/* Welcome text */}
      <div className="mt-2">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          Welcome to YidVid
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-md">
          Your gateway to curated Jewish content.
          <br />
          Discover videos that inspire, entertain, and connect.
        </p>
      </div>
    </motion.div>
  );
};


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TemporaryDisclaimer = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleBrowseVideos = () => {
    navigate('/videos');
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-[#135d66] border-2 border-[#77b0aa] rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl relative"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#e3fef7] hover:text-[#77b0aa] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <AlertTriangle className="w-12 h-12 text-[#e3fef7] mx-auto mb-4" />
        
        <h2 className="text-[#e3fef7] text-2xl font-bold mb-4">
          Site Under Construction
        </h2>
        
        <p className="text-[#e3fef7] text-lg leading-relaxed mb-4">
          We're currently making improvements to our site. 
          This will take just a few more minutes until everything looks perfect.
        </p>
        
        <p className="text-[#77b0aa] text-base mb-6">
          Sorry for the inconvenience!
        </p>

        {/* Browse Videos button */}
        <button
          onClick={handleBrowseVideos}
          className="w-full py-3 bg-[#77b0aa] text-[#003c43] rounded-xl font-medium hover:bg-[#e3fef7] transition-colors mb-6"
        >
          Browse Videos
        </button>
        
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-[#77b0aa] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#77b0aa] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#77b0aa] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

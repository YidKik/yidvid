
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export const TemporaryDisclaimer = () => {
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-[#135d66] border-2 border-[#77b0aa] rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AlertTriangle className="w-12 h-12 text-[#e3fef7] mx-auto mb-4" />
        
        <h2 className="text-[#e3fef7] text-2xl font-bold mb-4">
          Site Under Construction
        </h2>
        
        <p className="text-[#e3fef7] text-lg leading-relaxed mb-4">
          We're currently making improvements to our site. 
          This will take just a few more minutes until everything looks perfect.
        </p>
        
        <p className="text-[#77b0aa] text-base">
          Sorry for the inconvenience!
        </p>
        
        <div className="mt-6 flex justify-center">
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

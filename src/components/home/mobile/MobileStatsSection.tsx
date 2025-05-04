
import React from 'react';
import { motion } from "framer-motion";
import { NumberTicker } from "@/components/ui/number-ticker";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

export const MobileStatsSection = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="mt-12 space-y-4"
    >
      <div className="border-2 border-[#ddf9f2] rounded-3xl p-6 text-center bg-[#003c43]">
        <p className="text-[#77b0aa] text-xl mb-1">Over</p>
        <p className="text-[#e3fef7] text-5xl font-bold mb-1">
          <NumberTicker 
            value={10000} 
            className="text-[#e3fef7] text-5xl font-bold"
          />
        </p>
        <p className="text-[#77b0aa] text-xl">Videos</p>
      </div>
      
      <div className="border-2 border-[#ddf9f2] rounded-3xl p-6 text-center bg-[#003c43]">
        <p className="text-[#77b0aa] text-xl mb-1">Over</p>
        <p className="text-[#e3fef7] text-5xl font-bold mb-1">
          <NumberTicker 
            value={400} 
            className="text-[#e3fef7] text-5xl font-bold"
          />
        </p>
        <p className="text-[#77b0aa] text-xl">Channels</p>
      </div>
    </motion.div>
  );
};

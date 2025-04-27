
import React from 'react';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

export const MobileFeaturesSection = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-24 flex justify-center gap-4"
    >
      {['Free', 'Kosher', 'Up to date'].map((text) => (
        <div 
          key={text}
          className="px-4 py-2 border border-[#ddf9f2] rounded-full text-[#e3fef7] text-sm bg-[#135d66]"
        >
          {text}
        </div>
      ))}
    </motion.div>
  );
};

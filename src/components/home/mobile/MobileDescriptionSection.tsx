
import React from 'react';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

export const MobileDescriptionSection = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="mt-8 text-sm text-[#e3fef7] leading-relaxed space-y-4 bg-[#135d66] px-4 py-6"
    >
      {/* Section intentionally left empty as per user request */}
    </motion.div>
  );
};


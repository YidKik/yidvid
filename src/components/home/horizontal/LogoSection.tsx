
import React from 'react';
import { motion } from 'framer-motion';

interface LogoSectionProps {
  currentSection: number;
}

export const LogoSection = ({ currentSection }: LogoSectionProps) => {
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={currentSection >= 2 ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="w-64 h-48 bg-[#135d66] rounded-3xl flex items-center justify-center border-2 border-[#77b0aa]">
        <div className="w-32 h-24 bg-[#77b0aa] rounded-2xl flex items-center justify-center">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-[#003c43]"></div>
        </div>
      </div>
    </motion.div>
  );
};

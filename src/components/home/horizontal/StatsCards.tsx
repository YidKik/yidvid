
import React from 'react';
import { motion } from 'framer-motion';
import { NumberTicker } from '@/components/ui/number-ticker';

interface StatsCardsProps {
  currentSection: number;
}

export const StatsCards = ({ currentSection }: StatsCardsProps) => {
  return (
    <motion.div 
      className="flex flex-col gap-8 mb-8"
      initial={{ opacity: 0, y: -50 }}
      animate={currentSection >= 2 ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="bg-transparent border-2 border-[#77b0aa] rounded-3xl p-12 w-80 h-64 text-center">
        <p className="text-[#77b0aa] text-xl mb-4">Over</p>
        <div className="text-[#e3fef7] text-6xl font-bold mb-4">
          {currentSection >= 2 ? <NumberTicker value={10000} /> : '0'}
        </div>
        <p className="text-[#77b0aa] text-2xl">Videos</p>
      </div>
      <div className="bg-transparent border-2 border-[#77b0aa] rounded-3xl p-12 w-80 h-64 text-center">
        <p className="text-[#77b0aa] text-xl mb-4">Over</p>
        <div className="text-[#e3fef7] text-6xl font-bold mb-4">
          {currentSection >= 2 ? <NumberTicker value={400} /> : '0'}
        </div>
        <p className="text-[#77b0aa] text-2xl">Channels</p>
      </div>
    </motion.div>
  );
};


import React from 'react';
import { motion } from 'framer-motion';
import { GridMotion } from '@/components/ui/grid-motion';

interface AnimatedGridSectionProps {
  channelItems: string[];
}

export const AnimatedGridSection: React.FC<AnimatedGridSectionProps> = ({ channelItems }) => {
  return (
    <motion.section 
      className="relative z-10 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="w-full px-0 py-20">
        <div className="w-full h-[200px] overflow-visible">
          <GridMotion 
            items={channelItems}
            className="relative z-10 w-full h-full opacity-70"
          />
        </div>
      </div>
    </motion.section>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import yidvidLogoIcon from '@/assets/yidvid-logo-icon.png';

interface AnimatedPlayLogoProps {
  className?: string;
}

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Static logo always visible */}
      <img
        src={yidvidLogoIcon}
        alt="YidVid Logo"
        className="relative w-full h-full object-contain"
        draggable={false}
      />

      {/* Shine sweep: left to right across the logo */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.1 }}
      >
        <motion.div
          className="absolute h-full w-[40%] -skew-x-12"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, hsl(0 100% 50% / 0.3) 25%, hsl(48 100% 50% / 0.4) 50%, hsl(0 100% 50% / 0.3) 75%, transparent 100%)',
            left: '-40%',
            top: 0,
          }}
          animate={{ left: '140%' }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </motion.div>
    </div>
  );
};

export default AnimatedPlayLogo;

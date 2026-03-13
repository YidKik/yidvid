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
        style={{ filter: 'drop-shadow(0 6px 18px hsl(0 100% 50% / 0.24))' }}
        draggable={false}
      />

      {/* Diagonal red-yellow shine sweep: top-right to bottom-left */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-[18%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.15 }}
      >
        <motion.div
          className="absolute w-[60%] h-[200%] rotate-[35deg]"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, hsl(0 100% 50% / 0.35) 30%, hsl(48 100% 50% / 0.45) 50%, hsl(0 100% 50% / 0.35) 70%, transparent 100%)',
            top: '-100%',
            right: '-60%',
          }}
          animate={{ top: '100%', right: '100%' }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </motion.div>
    </div>
  );
};

export default AnimatedPlayLogo;

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedPlayLogoProps {
  className?: string;
}

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  // The play button is divided into 3 horizontal sections
  // Each section slides out from the left sequentially
  
  const sectionVariants = {
    hidden: { 
      x: -100, 
      opacity: 0,
      scale: 0.8
    },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3 + i * 0.15,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth slide
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren"
      }
    }
  };

  // Colors for the three sections (matching YidVid branding - red tones)
  const colors = {
    top: '#FF3333',      // Lighter red
    middle: '#FF0000',   // Pure red  
    bottom: '#CC0000'    // Darker red
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 10px 30px rgba(255, 0, 0, 0.3))' }}
      >
        {/* Define clip paths for the three sections */}
        <defs>
          {/* Top section - upper third of play triangle */}
          <clipPath id="topSection">
            <polygon points="10,10 90,50 10,33.33" />
          </clipPath>
          
          {/* Middle section - middle third of play triangle */}
          <clipPath id="middleSection">
            <polygon points="10,33.33 90,50 10,66.67" />
          </clipPath>
          
          {/* Bottom section - lower third of play triangle */}
          <clipPath id="bottomSection">
            <polygon points="10,66.67 90,50 10,90" />
          </clipPath>
        </defs>

        {/* Background glow effect */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="35"
          ry="35"
          fill="rgba(255, 0, 0, 0.1)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />

        {/* Top section */}
        <motion.g
          custom={0}
          variants={sectionVariants}
          style={{ originX: 0, originY: 0.33 }}
        >
          <polygon 
            points="10,10 90,50 10,33.33" 
            fill={colors.top}
            style={{ 
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
            }}
          />
          {/* Highlight on top edge */}
          <line 
            x1="10" y1="10" 
            x2="90" y2="50" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="1"
          />
        </motion.g>

        {/* Middle section */}
        <motion.g
          custom={1}
          variants={sectionVariants}
          style={{ originX: 0, originY: 0.5 }}
        >
          <polygon 
            points="10,33.33 90,50 10,66.67" 
            fill={colors.middle}
            style={{ 
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
            }}
          />
        </motion.g>

        {/* Bottom section */}
        <motion.g
          custom={2}
          variants={sectionVariants}
          style={{ originX: 0, originY: 0.67 }}
        >
          <polygon 
            points="10,66.67 90,50 10,90" 
            fill={colors.bottom}
            style={{ 
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
            }}
          />
          {/* Shadow on bottom edge */}
          <line 
            x1="10" y1="90" 
            x2="90" y2="50" 
            stroke="rgba(0,0,0,0.15)" 
            strokeWidth="1"
          />
        </motion.g>

        {/* Subtle inner highlight after all sections are in */}
        <motion.polygon
          points="15,18 80,50 15,82"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        />
      </svg>

      {/* Shine effect that sweeps across after animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="absolute w-[200%] h-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            left: '-200%'
          }}
          animate={{ left: '200%' }}
          transition={{ 
            delay: 1.2, 
            duration: 0.8, 
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedPlayLogo;

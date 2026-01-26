import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedPlayLogoProps {
  className?: string;
}

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  // The logo is a play button (triangle) with 3 horizontal white stripes
  // dividing it into 3 slices. Animation: each slice reveals from left to right
  
  const sliceVariants = {
    hidden: (i: number) => ({ 
      clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
      opacity: 0.3
    }),
    visible: (i: number) => ({
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      opacity: 1,
      transition: {
        delay: 0.2 + i * 0.25,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  // Play triangle coordinates - pointing right
  // The triangle is divided into 3 horizontal slices by white gaps
  const triangleHeight = 80;
  const triangleWidth = 70;
  const startX = 15;
  const startY = 10;
  const tipX = startX + triangleWidth; // 85
  const tipY = startY + triangleHeight / 2; // 50
  
  // Gap size between slices
  const gapSize = 3;
  
  // Calculate the three slice polygons
  // Slice 1: Top third
  const slice1TopY = startY;
  const slice1BottomY = startY + (triangleHeight / 3) - gapSize/2;
  
  // Slice 2: Middle third  
  const slice2TopY = startY + (triangleHeight / 3) + gapSize/2;
  const slice2BottomY = startY + (2 * triangleHeight / 3) - gapSize/2;
  
  // Slice 3: Bottom third
  const slice3TopY = startY + (2 * triangleHeight / 3) + gapSize/2;
  const slice3BottomY = startY + triangleHeight;

  // Helper to calculate X position on triangle edge at a given Y
  const getTriangleX = (y: number) => {
    // Linear interpolation from left edge to tip
    const progress = Math.abs(y - tipY) / (triangleHeight / 2);
    return tipX - (tipX - startX) * progress;
  };

  // Build polygon points for each slice
  const getSlicePoints = (topY: number, bottomY: number) => {
    const topRightX = getTriangleX(topY);
    const bottomRightX = getTriangleX(bottomY);
    return `${startX},${topY} ${topRightX},${topY} ${bottomRightX},${bottomY} ${startX},${bottomY}`;
  };

  const slice1Points = `${startX},${slice1TopY} ${getTriangleX(slice1TopY)},${slice1TopY} ${tipX},${tipY} ${getTriangleX(slice1BottomY)},${slice1BottomY} ${startX},${slice1BottomY}`;
  const slice2Points = `${startX},${slice2TopY} ${getTriangleX(slice2TopY)},${slice2TopY} ${tipX},${tipY} ${getTriangleX(slice2BottomY)},${slice2BottomY} ${startX},${slice2BottomY}`;
  const slice3Points = `${startX},${slice3TopY} ${getTriangleX(slice3TopY)},${slice3TopY} ${tipX},${tipY} ${getTriangleX(slice3BottomY)},${slice3BottomY} ${startX},${slice3BottomY}`;

  // Red color matching the brand
  const redColor = '#FF0000';

  return (
    <motion.div
      className={`relative ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(255, 0, 0, 0.35))' }}
      >
        {/* Background glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="rgba(255, 0, 0, 0.08)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        />

        {/* Slice 1 - Top */}
        <motion.polygon
          points={slice1Points}
          fill={redColor}
          custom={0}
          variants={sliceVariants}
          initial="hidden"
          animate="visible"
          style={{ 
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))'
          }}
        />

        {/* Slice 2 - Middle */}
        <motion.polygon
          points={slice2Points}
          fill={redColor}
          custom={1}
          variants={sliceVariants}
          initial="hidden"
          animate="visible"
          style={{ 
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))'
          }}
        />

        {/* Slice 3 - Bottom */}
        <motion.polygon
          points={slice3Points}
          fill={redColor}
          custom={2}
          variants={sliceVariants}
          initial="hidden"
          animate="visible"
          style={{ 
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))'
          }}
        />
      </svg>

      {/* Shine sweep effect after animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="absolute w-[150%] h-full -skew-x-12"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            left: '-150%'
          }}
          animate={{ left: '150%' }}
          transition={{ 
            delay: 1.3, 
            duration: 0.7, 
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedPlayLogo;

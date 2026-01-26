import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedPlayLogoProps {
  className?: string;
}

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  // The logo is a play button (triangle) divided into 3 HORIZONTAL slices (top, middle, bottom)
  // Animation: each slice SLIDES IN from left to right, one after another
  
  const sliceVariants = {
    hidden: { 
      x: -120,
      opacity: 0
    },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.3 + i * 0.2,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 120,
        damping: 14
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Triangle dimensions
  const leftX = 15;      // Left edge of triangle
  const rightX = 85;     // Tip of triangle (right point)
  const topY = 10;       // Top of triangle
  const bottomY = 90;    // Bottom of triangle
  const midY = 50;       // Middle (where tip is)
  
  // Gap between slices
  const gap = 4;
  
  // Calculate Y positions for each slice
  const slice1Top = topY;
  const slice1Bottom = topY + (bottomY - topY) / 3 - gap / 2;
  
  const slice2Top = topY + (bottomY - topY) / 3 + gap / 2;
  const slice2Bottom = topY + 2 * (bottomY - topY) / 3 - gap / 2;
  
  const slice3Top = topY + 2 * (bottomY - topY) / 3 + gap / 2;
  const slice3Bottom = bottomY;

  // Helper: get X coordinate on the triangle edge at a given Y
  const getEdgeX = (y: number): number => {
    // The triangle has its tip at (rightX, midY)
    // Top edge goes from (leftX, topY) to (rightX, midY)
    // Bottom edge goes from (leftX, bottomY) to (rightX, midY)
    if (y <= midY) {
      // On top edge
      const t = (y - topY) / (midY - topY);
      return leftX + t * (rightX - leftX);
    } else {
      // On bottom edge
      const t = (bottomY - y) / (bottomY - midY);
      return leftX + t * (rightX - leftX);
    }
  };

  // Build the polygon points for each slice
  // Each slice is a quadrilateral (or pentagon if it includes the tip)
  
  // Slice 1 (Top): trapezoid
  const s1_topLeft = `${leftX},${slice1Top}`;
  const s1_topRight = `${getEdgeX(slice1Top)},${slice1Top}`;
  const s1_bottomRight = `${getEdgeX(slice1Bottom)},${slice1Bottom}`;
  const s1_bottomLeft = `${leftX},${slice1Bottom}`;
  const slice1Points = `${s1_topLeft} ${s1_topRight} ${s1_bottomRight} ${s1_bottomLeft}`;
  
  // Slice 2 (Middle): includes the tip, so it's a pentagon
  const s2_topLeft = `${leftX},${slice2Top}`;
  const s2_topRight = `${getEdgeX(slice2Top)},${slice2Top}`;
  const s2_tip = `${rightX},${midY}`;
  const s2_bottomRight = `${getEdgeX(slice2Bottom)},${slice2Bottom}`;
  const s2_bottomLeft = `${leftX},${slice2Bottom}`;
  const slice2Points = `${s2_topLeft} ${s2_topRight} ${s2_tip} ${s2_bottomRight} ${s2_bottomLeft}`;
  
  // Slice 3 (Bottom): trapezoid
  const s3_topLeft = `${leftX},${slice3Top}`;
  const s3_topRight = `${getEdgeX(slice3Top)},${slice3Top}`;
  const s3_bottomRight = `${getEdgeX(slice3Bottom)},${slice3Bottom}`;
  const s3_bottomLeft = `${leftX},${slice3Bottom}`;
  const slice3Points = `${s3_topLeft} ${s3_topRight} ${s3_bottomRight} ${s3_bottomLeft}`;

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
        className="w-full h-full overflow-visible"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(255, 0, 0, 0.35))' }}
      >
        {/* Background glow - appears after slices */}
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="rgba(255, 0, 0, 0.08)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        />

        {/* Slice 1 - Top (slides in first) */}
        <motion.polygon
          points={slice1Points}
          fill={redColor}
          custom={0}
          variants={sliceVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Slice 2 - Middle (slides in second) */}
        <motion.polygon
          points={slice2Points}
          fill={redColor}
          custom={1}
          variants={sliceVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Slice 3 - Bottom (slides in third) */}
        <motion.polygon
          points={slice3Points}
          fill={redColor}
          custom={2}
          variants={sliceVariants}
          initial="hidden"
          animate="visible"
        />
      </svg>

      {/* Shine sweep effect after animation completes */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <motion.div
          className="absolute w-[150%] h-full -skew-x-12"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            left: '-150%'
          }}
          animate={{ left: '150%' }}
          transition={{ 
            delay: 1.4, 
            duration: 0.6, 
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedPlayLogo;

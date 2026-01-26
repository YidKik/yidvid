 import React from 'react';
 import { motion } from 'framer-motion';
 
 interface AnimatedPlayLogoProps {
   className?: string;
 }
 
 export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
   // The logo is a play button divided into 3 VERTICAL slices (left, middle, right)
   // Each vertical slice slides in from left to right, one after another
  
   const sliceVariants = {
     hidden: { 
       x: -100,
       opacity: 0
     },
     visible: (i: number) => ({
       x: 0,
       opacity: 1,
       transition: {
         delay: 0.3 + i * 0.25,
         duration: 0.55,
         ease: [0.25, 0.46, 0.45, 0.94],
         type: "spring",
         stiffness: 110,
         damping: 15
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

   // Red color matching the brand
   const redColor = '#FF0000';
 
   // The play button triangle points right
   // Left edge: x=15, from y=10 to y=90
   // Tip: x=85, y=50
   
   const leftX = 15;
   const tipX = 85;
   const topY = 10;
   const bottomY = 90;
   const midY = 50;
   
   // Vertical gaps between slices
   const gap = 5;
   
   // SLICE 1: Left vertical section (tall rounded rectangle)
   const slice1Left = leftX;
   const slice1Right = leftX + 20 - gap/2;
   const slice1Top = topY;
   const slice1Bottom = bottomY;
   
   // SLICE 2: Middle vertical section (main triangle body)
   const slice2Left = leftX + 20 + gap/2;
   const slice2Right = tipX - 18 - gap/2;
   
   // Calculate the top and bottom Y for slice 2 at its edges
   const getYAtX = (x: number, topEdge: boolean): number => {
     const t = (x - leftX) / (tipX - leftX);
     if (topEdge) {
       return topY + t * (midY - topY);
     } else {
       return bottomY - t * (bottomY - midY);
     }
   };
   
   const s2_topLeft_y = getYAtX(slice2Left, true);
   const s2_bottomLeft_y = getYAtX(slice2Left, false);
   const s2_topRight_y = getYAtX(slice2Right, true);
   const s2_bottomRight_y = getYAtX(slice2Right, false);
   
   // SLICE 3: Right vertical section (tip triangle)
   const slice3Left = tipX - 18 + gap/2;
   const s3_topLeft_y = getYAtX(slice3Left, true);
   const s3_bottomLeft_y = getYAtX(slice3Left, false);
   
   // Polygon points for each slice
   const slice1Points = `${slice1Left},${slice1Top} ${slice1Right},${slice1Top} ${slice1Right},${slice1Bottom} ${slice1Left},${slice1Bottom}`;
   
   const slice2Points = `${slice2Left},${s2_topLeft_y} ${slice2Right},${s2_topRight_y} ${slice2Right},${s2_bottomRight_y} ${slice2Left},${s2_bottomLeft_y}`;
   
   const slice3Points = `${slice3Left},${s3_topLeft_y} ${tipX},${midY} ${slice3Left},${s3_bottomLeft_y}`;
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
         {/* Background glow */}
         <motion.ellipse
          cx="50"
          cy="50"
          r="42"
          fill="rgba(255, 0, 0, 0.08)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 1.3, duration: 0.4 }}
        />
        {/* Slice 1 - LEFT vertical section (slides in first) - rounded pill shape */}
        <motion.rect
          x={slice1Left}
          y={slice1Top}
          width={slice1Right - slice1Left}
          height={slice1Bottom - slice1Top}
          rx={(slice1Right - slice1Left) / 2}
          ry="8"
          fill={redColor}
          custom={0}
          variants={sliceVariants}
          initial="hidden"
          animate="visible"
        />
         {/* Slice 2 - MIDDLE vertical section (slides in second) */}
        <motion.polygon
          points={slice2Points}
          fill={redColor}
          custom={1}
          variants={sliceVariants}
          initial="hidden"
          animate="visible"
        />
         {/* Slice 3 - RIGHT vertical section / tip (slides in third) */}
         <motion.path
           d={`M ${slice3Left},${s3_topLeft_y} L ${tipX},${midY} L ${slice3Left},${s3_bottomLeft_y} Z`}
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
         transition={{ delay: 1.4 }}
      >
        <motion.div
          className="absolute w-[150%] h-full -skew-x-12"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            left: '-150%'
          }}
          animate={{ left: '150%' }}
           transition={{ delay: 1.5, duration: 0.6, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedPlayLogo;

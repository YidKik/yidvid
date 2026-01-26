import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import yidvidLogoIcon from '@/assets/yidvid-logo-icon.png';

interface AnimatedPlayLogoProps {
  className?: string;
}

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  const [showOriginalLogo, setShowOriginalLogo] = useState(false);
  
  // After animation completes, transition to original logo
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOriginalLogo(true);
    }, 2200); // Wait for animation to complete
    
    return () => clearTimeout(timer);
  }, []);

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

  const leftX = 15;
  const tipX = 85;
  const topY = 10;
  const bottomY = 90;
  const midY = 50;
  
  const gap = 5;
  
  const slice1Left = leftX + 3;
  const slice1Right = leftX + 15 - gap/2;
  const slice1Top = topY + 3;
  const slice1Bottom = bottomY - 3;
  const slice1Radius = 4;
  
  const slice2Left = leftX + 15 + gap/2;
  const slice2Right = tipX - 18 - gap/2;
  
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
  
  const slice3Left = tipX - 18 + gap/2;
  const s3_topLeft_y = getYAtX(slice3Left, true);
  const s3_bottomLeft_y = getYAtX(slice3Left, false);
  
  const slice2Points = `${slice2Left},${s2_topLeft_y} ${slice2Right},${s2_topRight_y} ${slice2Right},${s2_bottomRight_y} ${slice2Left},${s2_bottomLeft_y}`;

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {!showOriginalLogo ? (
          <motion.div
            key="animated-logo"
            className="w-full h-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ 
              opacity: 0, 
              scale: 1.08,
              transition: { duration: 0.5, ease: "easeInOut" }
            }}
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
              {/* Slice 1 - LEFT vertical section */}
              <motion.path
                d={`
                  M ${slice1Left + 2},${slice1Top}
                  L ${slice1Right - slice1Radius},${slice1Top}
                  Q ${slice1Right},${slice1Top} ${slice1Right},${slice1Top + slice1Radius}
                  L ${slice1Right},${slice1Bottom - slice1Radius}
                  Q ${slice1Right},${slice1Bottom} ${slice1Right - slice1Radius},${slice1Bottom}
                  L ${slice1Left + 2},${slice1Bottom}
                  Q ${slice1Left},${slice1Bottom} ${slice1Left},${slice1Bottom - 2}
                  L ${slice1Left},${slice1Top + 2}
                  Q ${slice1Left},${slice1Top} ${slice1Left + 2},${slice1Top}
                  Z
                `}
                fill={redColor}
                custom={0}
                variants={sliceVariants}
                initial="hidden"
                animate="visible"
              />
              {/* Slice 2 - MIDDLE vertical section */}
              <motion.polygon
                points={slice2Points}
                fill={redColor}
                custom={1}
                variants={sliceVariants}
                initial="hidden"
                animate="visible"
              />
              {/* Slice 3 - RIGHT vertical section / tip */}
              <motion.path
                d={`M ${slice3Left},${s3_topLeft_y} L ${tipX},${midY} L ${slice3Left},${s3_bottomLeft_y} Z`}
                fill={redColor}
                custom={2}
                variants={sliceVariants}
                initial="hidden"
                animate="visible"
              />
            </svg>

            {/* Shine sweep effect */}
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
        ) : (
          <motion.div
            key="original-logo"
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <img 
              src={yidvidLogoIcon} 
              alt="YidVid Logo" 
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(255, 0, 0, 0.35))' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedPlayLogo;

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
  children: React.ReactNode;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete, children }) => {
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'revealing' | 'complete'>('intro');
  const controls = useAnimation();
  
  const redColor = '#FF0000';
  
  // Timing configuration
  const slice1Delay = 0.1;
  const slice2Delay = 0.25;
  const slice3Delay = 0.4;
  const sweepDuration = 1.2;
  const settleDuration = 0.6;
  
  useEffect(() => {
    const runAnimation = async () => {
      // Wait for initial sweep animation
      await new Promise(resolve => setTimeout(resolve, (slice3Delay + sweepDuration + 0.3) * 1000));
      
      // Start revealing content
      setAnimationPhase('revealing');
      
      // Wait for settle animation
      await new Promise(resolve => setTimeout(resolve, settleDuration * 1000 + 500));
      
      // Complete
      setAnimationPhase('complete');
      onComplete();
    };
    
    runAnimation();
  }, [onComplete]);

  // Calculate positions
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const logoSize = Math.min(viewportWidth * 0.5, 500); // Logo size relative to viewport
  
  // Slice animation - sweep across screen then settle to right
  const getSliceVariants = (index: number) => ({
    initial: { 
      x: -logoSize * 2,
      opacity: 0
    },
    sweep: {
      x: [
        -logoSize * 2,           // Start off-screen left
        viewportWidth * 0.3,     // Move to center-ish
        viewportWidth * 0.35,    // Slow down slightly past center
        viewportWidth - logoSize - 40 // Settle on right side
      ],
      opacity: 1,
      transition: {
        x: {
          times: [0, 0.5, 0.7, 1],
          duration: sweepDuration + settleDuration,
          ease: [0.25, 0.1, 0.25, 1],
          delay: index === 0 ? slice1Delay : index === 1 ? slice2Delay : slice3Delay
        },
        opacity: {
          duration: 0.3,
          delay: index === 0 ? slice1Delay : index === 1 ? slice2Delay : slice3Delay
        }
      }
    }
  });

  // Content reveal animation - follows behind the logo
  const contentVariants = {
    hidden: { 
      clipPath: 'inset(0 100% 0 0)',
      opacity: 0
    },
    revealing: {
      clipPath: 'inset(0 0% 0 0)',
      opacity: 1,
      transition: {
        clipPath: {
          duration: 1,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.2
        },
        opacity: {
          duration: 0.5,
          delay: 0.1
        }
      }
    }
  };

  // Logo dimensions for SVG
  const leftX = 5;
  const tipX = 95;
  const topY = 10;
  const bottomY = 90;
  const midY = 50;
  const gap = 3;
  
  // Slice 1 dimensions
  const s1Left = leftX + 2;
  const s1Right = leftX + 12;
  const s1Top = topY + 2;
  const s1Bottom = bottomY - 2;
  const s1Radius = 3;
  
  // Helper for triangle edge calculation
  const getYAtX = (x: number, topEdge: boolean): number => {
    const t = (x - leftX) / (tipX - leftX);
    return topEdge ? topY + t * (midY - topY) : bottomY - t * (bottomY - midY);
  };
  
  // Slice 2 dimensions
  const s2Left = leftX + 14;
  const s2Right = tipX - 22;
  const s2TopLeft = getYAtX(s2Left, true);
  const s2BottomLeft = getYAtX(s2Left, false);
  const s2TopRight = getYAtX(s2Right, true);
  const s2BottomRight = getYAtX(s2Right, false);
  
  // Slice 3 dimensions
  const s3Left = tipX - 20;
  const s3TopLeft = getYAtX(s3Left, true);
  const s3BottomLeft = getYAtX(s3Left, false);

  const renderLogoSlice = (index: number) => {
    const variants = getSliceVariants(index);
    
    return (
      <motion.div
        key={index}
        className="fixed top-1/2 -translate-y-1/2 z-50 pointer-events-none"
        style={{ width: logoSize, height: logoSize }}
        variants={variants}
        initial="initial"
        animate="sweep"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 4px 20px rgba(255, 0, 0, 0.3))' }}>
          {index === 0 && (
            <path
              d={`
                M ${s1Left + 1},${s1Top}
                L ${s1Right - s1Radius},${s1Top}
                Q ${s1Right},${s1Top} ${s1Right},${s1Top + s1Radius}
                L ${s1Right},${s1Bottom - s1Radius}
                Q ${s1Right},${s1Bottom} ${s1Right - s1Radius},${s1Bottom}
                L ${s1Left + 1},${s1Bottom}
                Q ${s1Left},${s1Bottom} ${s1Left},${s1Bottom - 1}
                L ${s1Left},${s1Top + 1}
                Q ${s1Left},${s1Top} ${s1Left + 1},${s1Top}
                Z
              `}
              fill={redColor}
            />
          )}
          {index === 1 && (
            <polygon
              points={`${s2Left},${s2TopLeft} ${s2Right},${s2TopRight} ${s2Right},${s2BottomRight} ${s2Left},${s2BottomLeft}`}
              fill={redColor}
            />
          )}
          {index === 2 && (
            <path
              d={`M ${s3Left},${s3TopLeft} L ${tipX},${midY} L ${s3Left},${s3BottomLeft} Z`}
              fill={redColor}
            />
          )}
        </svg>
      </motion.div>
    );
  };

  // Final settled logo (appears after animation)
  const FinalLogo = () => (
    <motion.div
      className="fixed top-1/2 -translate-y-1/2 z-40 pointer-events-none"
      style={{ 
        width: logoSize * 0.8, 
        height: logoSize * 0.8,
        right: 20
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: animationPhase === 'complete' ? 0.15 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d={`
            M ${s1Left + 1},${s1Top}
            L ${s1Right - s1Radius},${s1Top}
            Q ${s1Right},${s1Top} ${s1Right},${s1Top + s1Radius}
            L ${s1Right},${s1Bottom - s1Radius}
            Q ${s1Right},${s1Bottom} ${s1Right - s1Radius},${s1Bottom}
            L ${s1Left + 1},${s1Bottom}
            Q ${s1Left},${s1Bottom} ${s1Left},${s1Bottom - 1}
            L ${s1Left},${s1Top + 1}
            Q ${s1Left},${s1Top} ${s1Left + 1},${s1Top}
            Z
          `}
          fill={redColor}
        />
        <polygon
          points={`${s2Left},${s2TopLeft} ${s2Right},${s2TopRight} ${s2Right},${s2BottomRight} ${s2Left},${s2BottomLeft}`}
          fill={redColor}
        />
        <path
          d={`M ${s3Left},${s3TopLeft} L ${tipX},${midY} L ${s3Left},${s3BottomLeft} Z`}
          fill={redColor}
        />
      </svg>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Logo slices that sweep across */}
      {animationPhase === 'intro' && (
        <>
          {renderLogoSlice(0)}
          {renderLogoSlice(1)}
          {renderLogoSlice(2)}
        </>
      )}
      
      {/* Decorative settled logo on right side */}
      <FinalLogo />
      
      {/* Main content that reveals behind logo */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate={animationPhase !== 'intro' ? 'revealing' : 'hidden'}
        className="relative z-30"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default IntroAnimation;

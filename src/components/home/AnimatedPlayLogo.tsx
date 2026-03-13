import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import yidvidLogoIcon from '@/assets/yidvid-logo-icon.png';

interface AnimatedPlayLogoProps {
  className?: string;
}

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  const [showOriginalLogo, setShowOriginalLogo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOriginalLogo(true);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Brand colors
  const red = '#FF0000';
  const white = '#FFFFFF';

  // Stroke animation shared config
  const strokeVariants = {
    hidden: (from: { x: number; y: number }) => ({
      x: from.x,
      y: from.y,
      opacity: 0,
      pathLength: 0,
    }),
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      pathLength: 1,
    },
  };

  const strokeTransition = (delay: number) => ({
    x: { delay, duration: 0.5, type: 'spring' as const, stiffness: 120, damping: 14 },
    y: { delay, duration: 0.5, type: 'spring' as const, stiffness: 120, damping: 14 },
    opacity: { delay, duration: 0.2 },
    pathLength: { delay: delay + 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  });

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {!showOriginalLogo ? (
          <motion.div
            key="animated-logo"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.06,
              transition: { duration: 0.45, ease: 'easeInOut' },
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full overflow-visible"
              style={{ filter: 'drop-shadow(0 6px 20px rgba(255, 0, 0, 0.3))' }}
            >
              {/* Background glow - yellow + red */}
              <motion.ellipse
                cx="50"
                cy="50"
                rx="48"
                ry="48"
                fill="rgba(255, 204, 0, 0.12)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              />
              <motion.ellipse
                cx="50"
                cy="50"
                rx="42"
                ry="42"
                fill="rgba(255, 0, 0, 0.08)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.4 }}
              />

              {/* Phase 1: Rounded red rectangle expands from center */}
              <motion.rect
                x="10"
                y="10"
                width="80"
                height="80"
                rx="18"
                ry="18"
                fill={red}
                initial={{ scaleX: 0.02, scaleY: 0.85, opacity: 0 }}
                animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
                transition={{
                  scaleX: {
                    duration: 0.55,
                    type: 'spring',
                    stiffness: 100,
                    damping: 12,
                  },
                  scaleY: {
                    delay: 0.15,
                    duration: 0.4,
                    type: 'spring',
                    stiffness: 100,
                    damping: 14,
                  },
                  opacity: { duration: 0.15 },
                }}
                style={{ originX: '50%', originY: '50%' }}
              />

              {/* Phase 2: Y letterform — 3 strokes */}

              {/* Y left diagonal arm (top-left to center junction) */}
              <motion.line
                x1="22" y1="28"
                x2="36" y2="50"
                stroke={white}
                strokeWidth="7"
                strokeLinecap="round"
                custom={{ x: -25, y: -20 }}
                variants={strokeVariants}
                initial="hidden"
                animate="visible"
                transition={strokeTransition(0.6)}
              />

              {/* Y right diagonal arm (top-right to center junction) */}
              <motion.line
                x1="50" y1="28"
                x2="36" y2="50"
                stroke={white}
                strokeWidth="7"
                strokeLinecap="round"
                custom={{ x: 20, y: -25 }}
                variants={strokeVariants}
                initial="hidden"
                animate="visible"
                transition={strokeTransition(0.72)}
              />

              {/* Y vertical stem (center junction to bottom) */}
              <motion.line
                x1="36" y1="50"
                x2="36" y2="74"
                stroke={white}
                strokeWidth="7"
                strokeLinecap="round"
                custom={{ x: 0, y: 30 }}
                variants={strokeVariants}
                initial="hidden"
                animate="visible"
                transition={strokeTransition(0.85)}
              />

              {/* Phase 2: V letterform — 2 strokes + slash */}

              {/* V left stroke (top to bottom vertex) */}
              <motion.line
                x1="58" y1="28"
                x2="68" y2="74"
                stroke={white}
                strokeWidth="7"
                strokeLinecap="round"
                custom={{ x: -15, y: -30 }}
                variants={strokeVariants}
                initial="hidden"
                animate="visible"
                transition={strokeTransition(0.95)}
              />

              {/* V right stroke (top to bottom vertex) */}
              <motion.line
                x1="78" y1="28"
                x2="68" y2="74"
                stroke={white}
                strokeWidth="7"
                strokeLinecap="round"
                custom={{ x: 25, y: -20 }}
                variants={strokeVariants}
                initial="hidden"
                animate="visible"
                transition={strokeTransition(1.08)}
              />

              {/* Diagonal slash through the V */}
              <motion.line
                x1="56" y1="60"
                x2="80" y2="38"
                stroke={white}
                strokeWidth="4.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { delay: 1.25, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                  opacity: { delay: 1.25, duration: 0.15 },
                }}
              />
            </svg>

            {/* Phase 3: Shine sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-[18%]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <motion.div
                className="absolute w-[150%] h-full -skew-x-12"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 45%, rgba(255,204,0,0.2) 55%, transparent 100%)',
                  left: '-150%',
                }}
                animate={{ left: '150%' }}
                transition={{ delay: 1.55, duration: 0.55, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Yellow/red glow pulse */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,204,0,0.15) 0%, rgba(255,0,0,0.08) 50%, transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.15, 1.2] }}
              transition={{ delay: 1.6, duration: 0.7, ease: 'easeOut' }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="original-logo"
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <img
              src={yidvidLogoIcon}
              alt="YidVid Logo"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 6px 20px rgba(255, 0, 0, 0.3))' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedPlayLogo;

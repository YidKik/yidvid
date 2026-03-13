import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import yidvidLogoIcon from '@/assets/yidvid-logo-icon.png';

interface AnimatedPlayLogoProps {
  className?: string;
}

interface LogoPiece {
  id: string;
  clipPath: string;
  initial: { x: number; y: number; rotate: number };
  delay: number;
}

const logoPieces: LogoPiece[] = [
  {
    id: 'left-y',
    clipPath: 'polygon(0% 0%, 34% 0%, 30% 100%, 0% 100%)',
    initial: { x: -34, y: -12, rotate: -8 },
    delay: 0.36,
  },
  {
    id: 'center-y',
    clipPath: 'polygon(20% 0%, 50% 0%, 46% 100%, 16% 100%)',
    initial: { x: -10, y: 30, rotate: 7 },
    delay: 0.5,
  },
  {
    id: 'bridge',
    clipPath: 'polygon(34% 20%, 66% 12%, 62% 52%, 36% 58%)',
    initial: { x: 0, y: -26, rotate: -6 },
    delay: 0.64,
  },
  {
    id: 'left-v',
    clipPath: 'polygon(44% 0%, 76% 0%, 72% 100%, 40% 100%)',
    initial: { x: 18, y: -24, rotate: 8 },
    delay: 0.78,
  },
  {
    id: 'right-v',
    clipPath: 'polygon(66% 0%, 100% 0%, 100% 100%, 62% 100%)',
    initial: { x: 34, y: 16, rotate: 10 },
    delay: 0.92,
  },
  {
    id: 'v-tail',
    clipPath: 'polygon(56% 54%, 90% 48%, 80% 100%, 50% 100%)',
    initial: { x: 10, y: 28, rotate: -7 },
    delay: 1.02,
  },
];

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  const [showOriginalLogo, setShowOriginalLogo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOriginalLogo(true);
    }, 2350);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {!showOriginalLogo ? (
          <motion.div
            key="assembled-logo"
            className="relative w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.04,
              transition: { duration: 0.4, ease: 'easeInOut' },
            }}
          >
            <motion.div
              className="absolute -inset-[10%] pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, hsl(48 100% 50% / 0.14) 0%, hsl(0 100% 50% / 0.1) 48%, transparent 72%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0.55], scale: [0.8, 1.08, 1] }}
              transition={{ duration: 0.9, delay: 1.28, ease: 'easeOut' }}
            />

            {logoPieces.map((piece) => (
              <motion.div
                key={piece.id}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${yidvidLogoIcon})`,
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  clipPath: piece.clipPath,
                  WebkitClipPath: piece.clipPath,
                  filter: 'drop-shadow(0 6px 18px hsl(0 100% 50% / 0.22))',
                }}
                initial={{
                  x: piece.initial.x,
                  y: piece.initial.y,
                  rotate: piece.initial.rotate,
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                transition={{
                  x: { delay: piece.delay, duration: 0.5, type: 'spring', stiffness: 135, damping: 15 },
                  y: { delay: piece.delay, duration: 0.5, type: 'spring', stiffness: 135, damping: 15 },
                  rotate: { delay: piece.delay, duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
                  opacity: { delay: piece.delay, duration: 0.18 },
                  scale: { delay: piece.delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                }}
              />
            ))}

            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-[18%]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.45, duration: 0.2 }}
            >
              <motion.div
                className="absolute w-[150%] h-full -skew-x-12"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.42) 48%, hsl(48 100% 50% / 0.18) 56%, transparent 100%)',
                  left: '-150%',
                }}
                animate={{ left: '150%' }}
                transition={{ delay: 1.5, duration: 0.55, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="original-logo"
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <img
              src={yidvidLogoIcon}
              alt="YidVid Logo"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 6px 18px hsl(0 100% 50% / 0.24))' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedPlayLogo;

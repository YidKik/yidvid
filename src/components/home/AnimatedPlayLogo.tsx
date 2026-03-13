import React from 'react';
import { motion } from 'framer-motion';
import yidvidLogoIcon from '@/assets/yidvid-logo-icon.png';

interface AnimatedPlayLogoProps {
  className?: string;
}

interface LogoPiece {
  id: string;
  clipPath: string;
  from: { x: number; y: number; rotate: number };
  delay: number;
}

// Exact-logo piece assembly (uses real image slices, so final shape matches 1:1)
const logoPieces: LogoPiece[] = [
  {
    id: 'top-left',
    clipPath: 'inset(0% 66% 50% 0%)',
    from: { x: -34, y: -20, rotate: -10 },
    delay: 0.22,
  },
  {
    id: 'top-center',
    clipPath: 'inset(0% 33% 50% 33%)',
    from: { x: 0, y: -28, rotate: 6 },
    delay: 0.34,
  },
  {
    id: 'top-right',
    clipPath: 'inset(0% 0% 50% 66%)',
    from: { x: 30, y: -18, rotate: 10 },
    delay: 0.46,
  },
  {
    id: 'bottom-left',
    clipPath: 'inset(50% 66% 0% 0%)',
    from: { x: -24, y: 24, rotate: -8 },
    delay: 0.58,
  },
  {
    id: 'bottom-center',
    clipPath: 'inset(50% 33% 0% 33%)',
    from: { x: 0, y: 32, rotate: 5 },
    delay: 0.7,
  },
  {
    id: 'bottom-right',
    clipPath: 'inset(50% 0% 0% 66%)',
    from: { x: 32, y: 22, rotate: 9 },
    delay: 0.82,
  },
];

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Soft yellow/red glow */}
      <motion.div
        className="absolute -inset-[12%] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, hsl(48 100% 50% / 0.14) 0%, hsl(0 100% 50% / 0.1) 46%, transparent 72%)',
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0, 1, 0.55], scale: [0.85, 1.1, 1] }}
        transition={{ duration: 0.9, delay: 1.1, ease: 'easeOut' }}
      />

      {/* Animated exact-image pieces */}
      <div className="absolute inset-0">
        {logoPieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute inset-0"
            style={{
              clipPath: piece.clipPath,
              WebkitClipPath: piece.clipPath,
            }}
            initial={{
              x: piece.from.x,
              y: piece.from.y,
              rotate: piece.from.rotate,
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              x: 0,
              y: 0,
              rotate: 0,
              opacity: [0, 1, 1, 0],
              scale: [0.97, 1, 1, 1],
            }}
            transition={{
              x: { delay: piece.delay, duration: 0.52, type: 'spring', stiffness: 150, damping: 16 },
              y: { delay: piece.delay, duration: 0.52, type: 'spring', stiffness: 150, damping: 16 },
              rotate: { delay: piece.delay, duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
              opacity: {
                delay: piece.delay,
                duration: 2.05,
                times: [0, 0.14, 0.82, 1],
                ease: 'linear',
              },
              scale: { delay: piece.delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
            }}
          >
            <img
              src={yidvidLogoIcon}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 6px 18px hsl(0 100% 50% / 0.24))' }}
              draggable={false}
            />
          </motion.div>
        ))}
      </div>

      {/* Shine sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-[18%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.22, duration: 0.2 }}
      >
        <motion.div
          className="absolute w-[150%] h-full -skew-x-12"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.44) 48%, hsl(48 100% 50% / 0.2) 56%, transparent 100%)',
            left: '-150%',
          }}
          animate={{ left: '150%' }}
          transition={{ delay: 1.26, duration: 0.56, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Final true logo (exact reference size/position) */}
      <motion.img
        src={yidvidLogoIcon}
        alt="YidVid Logo"
        className="relative w-full h-full object-contain"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.84, duration: 0.42, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 6px 18px hsl(0 100% 50% / 0.24))' }}
        draggable={false}
      />
    </div>
  );
};

export default AnimatedPlayLogo;

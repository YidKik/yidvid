import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface AnimatedShapesProps {
  className?: string;
}

export const AnimatedShapes: React.FC<AnimatedShapesProps> = ({ className = '' }) => {
  const { scrollYProgress } = useScroll();

  // Create staggered transforms for each shape layer
  const layer1X = useTransform(scrollYProgress, [0, 0.3], ['0%', '-20%']);
  const layer2X = useTransform(scrollYProgress, [0, 0.3], ['0%', '-15%']);
  const layer3X = useTransform(scrollYProgress, [0, 0.3], ['0%', '-10%']);
  const layer4X = useTransform(scrollYProgress, [0, 0.3], ['0%', '-5%']);

  const layer1Scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.2]);
  const layer2Scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);
  const layer3Scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const layer4Scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.05]);

  const smoothLayer1X = useSpring(layer1X, { stiffness: 50, damping: 20 });
  const smoothLayer2X = useSpring(layer2X, { stiffness: 50, damping: 20 });
  const smoothLayer3X = useSpring(layer3X, { stiffness: 50, damping: 20 });
  const smoothLayer4X = useSpring(layer4X, { stiffness: 50, damping: 20 });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Layer 1 - Furthest back */}
      <motion.div
        style={{ x: smoothLayer1X, scale: layer1Scale }}
        className="absolute right-[-10%] top-0 h-full w-[60%]"
      >
        <svg viewBox="0 0 400 800" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <path
            d="M50 0 C200 0, 350 100, 350 200 L350 600 C350 700, 200 800, 50 800 L0 800 L0 0 Z"
            fill="rgba(255, 245, 238, 0.9)"
          />
        </svg>
      </motion.div>

      {/* Layer 2 */}
      <motion.div
        style={{ x: smoothLayer2X, scale: layer2Scale }}
        className="absolute right-[-5%] top-0 h-full w-[55%]"
      >
        <svg viewBox="0 0 400 800" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <path
            d="M50 0 C200 0, 350 100, 350 200 L350 600 C350 700, 200 800, 50 800 L0 800 L0 0 Z"
            fill="rgba(255, 230, 210, 0.85)"
          />
        </svg>
      </motion.div>

      {/* Layer 3 */}
      <motion.div
        style={{ x: smoothLayer3X, scale: layer3Scale }}
        className="absolute right-0 top-0 h-full w-[50%]"
      >
        <svg viewBox="0 0 400 800" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <path
            d="M50 0 C200 0, 350 100, 350 200 L350 600 C350 700, 200 800, 50 800 L0 800 L0 0 Z"
            fill="rgba(255, 200, 150, 0.8)"
          />
        </svg>
      </motion.div>

      {/* Layer 4 - Front with image mask effect */}
      <motion.div
        style={{ x: smoothLayer4X, scale: layer4Scale }}
        className="absolute right-[5%] top-0 h-full w-[45%]"
      >
        <svg viewBox="0 0 400 800" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="shapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(0, 100%, 65%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(40, 100%, 60%)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            d="M50 0 C200 0, 350 100, 350 200 L350 600 C350 700, 200 800, 50 800 L0 800 L0 0 Z"
            fill="url(#shapeGradient)"
          />
        </svg>
      </motion.div>

      {/* Animated vertical lines */}
      <div className="absolute right-[20%] top-0 h-full flex gap-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 0.1 }}
            transition={{ delay: i * 0.1, duration: 1, ease: 'easeOut' }}
            className="w-px bg-red-500 origin-top"
            style={{ height: '100%' }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedShapes;

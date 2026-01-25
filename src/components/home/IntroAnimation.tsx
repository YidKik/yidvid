import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import yidvidLogoIcon from '@/assets/yidvid-logo-icon.png';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'shapes' | 'logo' | 'reveal'>('shapes');
  
  useEffect(() => {
    // Phase timings - slightly longer for better effect
    const logoTimer = setTimeout(() => setPhase('logo'), 1000);
    const revealTimer = setTimeout(() => setPhase('reveal'), 2800);
    const completeTimer = setTimeout(() => onComplete(), 3500);
    
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Define gradient colors based on YidVid's red theme - from light to vibrant
  const waveColors = [
    'hsl(0, 100%, 97%)',   // Very light pink
    'hsl(0, 100%, 92%)',   // Light pink
    'hsl(0, 100%, 85%)',   // Medium light pink
    'hsl(0, 100%, 75%)',   // Medium pink
    'hsl(0, 100%, 60%)',   // Bright pink-red
    'hsl(0, 100%, 50%)',   // Brand red
  ];

  return (
    <AnimatePresence>
      {phase !== 'reveal' && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ backgroundColor: '#0a0a0a' }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }}
        >
          {/* Animated wave shapes - bracket/curved shapes like Shira Choir */}
          <div className="absolute inset-0 flex items-center justify-center">
            {waveColors.map((color, index) => (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  width: '30vw',
                  height: '120vh',
                }}
                initial={{ 
                  x: '-100vw',
                  opacity: 0,
                }}
                animate={{ 
                  x: `${-35 + index * 12}vw`,
                  opacity: 1,
                  transition: { 
                    duration: 1.0, 
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }}
              >
                <svg
                  viewBox="0 0 200 800"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  {/* Bracket-like curved shape similar to Shira Choir */}
                  <path
                    d="M0,0 
                       L120,0 
                       Q200,200 120,400 
                       Q40,600 120,800 
                       L0,800 
                       Z"
                    fill={color}
                  />
                </svg>
              </motion.div>
            ))}
          </div>

          {/* Decorative floating circles from right side */}
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{ 
              backgroundColor: 'hsla(0, 100%, 50%, 0.3)',
              top: '15%',
              right: '-10%',
              filter: 'blur(40px)'
            }}
            initial={{ x: '50vw', scale: 0 }}
            animate={{ 
              x: '-20vw', 
              scale: 1.5,
              transition: { duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }
            }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{ 
              backgroundColor: 'hsla(0, 100%, 70%, 0.4)',
              bottom: '20%',
              right: '-5%',
              filter: 'blur(30px)'
            }}
            initial={{ x: '50vw', scale: 0 }}
            animate={{ 
              x: '-30vw', 
              scale: 1.2,
              transition: { duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }
            }}
          />

          {/* Logo appearing in center */}
          <AnimatePresence>
            {phase === 'logo' && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-20"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { duration: 0.4 }
                }}
                exit={{ 
                  opacity: 0,
                  scale: 2,
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                }}
              >
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: { 
                      duration: 0.7, 
                      ease: [0.22, 1, 0.36, 1]
                    }
                  }}
                >
                  <motion.img
                    src={yidvidLogoIcon}
                    alt="YidVid"
                    className="w-36 h-36 md:w-52 md:h-52 drop-shadow-2xl"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: 1,
                      ease: 'easeInOut'
                    }}
                  />
                  
                  {/* Text appearing below logo */}
                  <motion.h1 
                    className="text-3xl md:text-5xl font-bold mt-6 text-center"
                    style={{ 
                      fontFamily: "'Nunito', 'Poppins', sans-serif",
                      color: 'hsl(0, 100%, 50%)',
                      letterSpacing: '-0.02em'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.4, duration: 0.5 }
                    }}
                  >
                    YidVid
                  </motion.h1>
                  
                  <motion.p
                    className="text-lg md:text-xl mt-3 text-center"
                    style={{ 
                      fontFamily: "'Quicksand', sans-serif",
                      color: 'hsla(0, 0%, 100%, 0.7)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { delay: 0.6, duration: 0.4 }
                    }}
                  >
                    Jewish Content
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated line decorations */}
          <motion.div
            className="absolute left-0 right-0 bottom-[30%] h-[2px]"
            style={{ backgroundColor: 'hsla(0, 100%, 50%, 0.3)' }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ 
              scaleX: 1,
              transition: { duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }
            }}
          />
          <motion.div
            className="absolute left-0 right-0 top-[25%] h-[1px]"
            style={{ backgroundColor: 'hsla(0, 100%, 60%, 0.2)' }}
            initial={{ scaleX: 0, originX: 1 }}
            animate={{ 
              scaleX: 1,
              transition: { duration: 1.0, delay: 0.7, ease: [0.22, 1, 0.36, 1] }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;

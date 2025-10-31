import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/yidvid-logo.png";

interface GoogleChatStyleLoadingProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const GoogleChatStyleLoading: React.FC<GoogleChatStyleLoadingProps> = ({
  isVisible,
  onComplete
}) => {
  const [startColorReveal, setStartColorReveal] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    if (!startColorReveal) return;

    // Once reveal starts, schedule exit and completion
    const exitTimer = setTimeout(() => {
      setShouldExit(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, startColorReveal, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && !shouldExit && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" }
          }}
        >
          {/* Logo container with slow scale animation */}
          <motion.div
            className="relative"
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ 
              scale: 1,
              opacity: 1
            }}
            transition={{
              duration: 3.5,
              ease: [0.22, 1, 0.36, 1], // Very smooth easing
            }}
            onAnimationComplete={() => {
              // Start color reveal immediately when scale completes
              setStartColorReveal(true);
            }}
          >
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Grayish version (base layer) */}
              <img
                src={logoImage}
                alt="YidVid Logo"
                className="w-full h-full object-contain absolute top-0 left-0"
                style={{
                  filter: "grayscale(100%) brightness(1.2) contrast(0.85)",
                }}
              />

              {/* Entire color layer masked to logo shape */}
              <div 
                className="absolute top-0 left-0 w-full h-full overflow-hidden"
                style={{
                  maskImage: `url(${logoImage})`,
                  WebkitMaskImage: `url(${logoImage})`,
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                }}
              >
                {/* Left-to-right reveal of colored content */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: startColorReveal ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                  transition={{ duration: 1.8, ease: [0.45, 0, 0.55, 1] }}
                >
                  {/* Color logo */}
                  <img 
                    src={logoImage} 
                    alt="YidVid Logo" 
                    className="w-full h-full object-contain" 
                  />

                  {/* Glow sweep - now fully contained by parent mask */}
                  <motion.div
                    className="absolute top-0 pointer-events-none"
                    initial={{ left: '-60%' }}
                    animate={{ 
                      left: startColorReveal ? '100%' : '-60%',
                    }}
                    transition={{ 
                      duration: 1.8, 
                      ease: 'easeInOut',
                    }}
                    style={{
                      width: '70%',
                      height: '100%',
                      background: 'radial-gradient(ellipse 60% 100%, rgba(255,120,120,0.85) 0%, rgba(239,68,68,0.6) 25%, rgba(255,100,100,0.3) 50%, rgba(239,68,68,0) 100%)',
                      filter: 'blur(22px)',
                      mixBlendMode: 'screen',
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

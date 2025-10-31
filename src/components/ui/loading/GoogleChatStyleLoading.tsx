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
    }, 1600);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 2100);

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
            onAnimationComplete={() => setStartColorReveal(true)}
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

              {/* Color + glow reveal masked strictly to logo shape */}
              <motion.div
                className="absolute top-0 left-0 w-full h-full"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: startColorReveal ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
                style={{
                  WebkitMaskImage: `url(${logoImage})`,
                  maskImage: `url(${logoImage})`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              >
                {/* Solid color image */}
                <img src={logoImage} alt="YidVid Logo" className="w-full h-full object-contain" />

                {/* Glow sweep inside logo only */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ x: '-40%' }}
                  animate={{ x: startColorReveal ? '110%' : '-40%' }}
                  transition={{ duration: 1.1, ease: 'easeInOut' }}
                  style={{
                    background: 'linear-gradient(90deg, rgba(239,68,68,0) 0%, rgba(239,68,68,0.55) 40%, rgba(239,68,68,0.95) 50%, rgba(239,68,68,0.55) 60%, rgba(239,68,68,0) 100%)',
                    filter: 'blur(24px) saturate(1.15)',
                    mixBlendMode: 'screen'
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

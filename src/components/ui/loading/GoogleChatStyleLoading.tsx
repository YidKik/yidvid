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
    if (isVisible) {
      // After logo scales up (3.5s), start color reveal
      const colorTimer = setTimeout(() => {
        setStartColorReveal(true);
      }, 3500);

      // After color reveal (5.5s total), start exit
      const exitTimer = setTimeout(() => {
        setShouldExit(true);
      }, 5500);

      // Complete callback after exit animation
      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 6000);

      return () => {
        clearTimeout(colorTimer);
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onComplete]);

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

              {/* Color version with left-to-right reveal */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={{ 
                    clipPath: startColorReveal ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)"
                  }}
                  transition={{
                    duration: 1.5,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                >
                  {/* Glow effect during transition */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full"
                    animate={{
                      filter: startColorReveal 
                        ? [
                            "drop-shadow(0 0 0px rgba(239, 68, 68, 0))",
                            "drop-shadow(0 0 40px rgba(239, 68, 68, 0.8))",
                            "drop-shadow(0 0 20px rgba(239, 68, 68, 0.4))",
                            "drop-shadow(0 0 0px rgba(239, 68, 68, 0))"
                          ]
                        : "drop-shadow(0 0 0px rgba(239, 68, 68, 0))"
                    }}
                    transition={{
                      duration: 1.5,
                      times: [0, 0.3, 0.7, 1],
                      ease: "easeInOut"
                    }}
                  >
                    <img
                      src={logoImage}
                      alt="YidVid Logo"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

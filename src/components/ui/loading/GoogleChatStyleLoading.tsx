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
  const [showColorBubble, setShowColorBubble] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // After logo scales up (2s), start bubble color transition
      const colorTimer = setTimeout(() => {
        setShowColorBubble(true);
      }, 2000);

      // After bubble animation (3s total), start exit
      const exitTimer = setTimeout(() => {
        setShouldExit(true);
      }, 3000);

      // Complete callback after exit animation
      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 3500);

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
          {/* Logo container with scale animation */}
          <motion.div
            className="relative"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ 
              scale: 1,
              opacity: 1
            }}
            transition={{
              duration: 2,
              ease: [0.16, 1, 0.3, 1], // Smooth elastic easing
            }}
          >
            <div className="relative w-56 h-56 md:w-72 md:h-72">
              {/* Two-tone grayish version */}
              <img
                src={logoImage}
                alt="YidVid Logo"
                className="w-full h-full object-contain absolute top-0 left-0"
                style={{
                  filter: "grayscale(100%) brightness(1.1) contrast(0.9)",
                }}
              />

              {/* Color version underneath */}
              <img
                src={logoImage}
                alt="YidVid Logo"
                className="w-full h-full object-contain absolute top-0 left-0"
              />

              {/* Bubble mask that reveals color */}
              <motion.div
                className="absolute top-0 left-0 w-full h-full overflow-hidden"
                style={{
                  maskImage: showColorBubble 
                    ? "radial-gradient(circle, black 100%, transparent 100%)"
                    : "radial-gradient(circle, black 0%, transparent 0%)",
                  WebkitMaskImage: showColorBubble
                    ? "radial-gradient(circle, black 100%, transparent 100%)"
                    : "radial-gradient(circle, black 0%, transparent 0%)",
                }}
              >
                <motion.div
                  className="w-full h-full"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: showColorBubble ? 2.5 : 0
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.34, 1.56, 0.64, 1],
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

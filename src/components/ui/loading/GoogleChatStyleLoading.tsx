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
  const [showColorVersion, setShowColorVersion] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // After logo scales up (1.2s), transition to color version
      const colorTimer = setTimeout(() => {
        setShowColorVersion(true);
      }, 1200);

      // After color transition (1.8s total), start exit
      const exitTimer = setTimeout(() => {
        setShouldExit(true);
      }, 1800);

      // Complete callback after exit animation
      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 2300);

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
          {/* Logo with scale animation */}
          <motion.div
            className="relative"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ 
              scale: 1,
              opacity: 1
            }}
            transition={{
              duration: 1.2,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy easing for Google Chat feel
            }}
          >
            {/* Grayscale version that fades out */}
            <motion.img
              src={logoImage}
              alt="YidVid Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
              style={{
                filter: "grayscale(100%) brightness(0.6)",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              animate={{
                opacity: showColorVersion ? 0 : 1,
              }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
            />

            {/* Color version that fades in */}
            <motion.img
              src={logoImage}
              alt="YidVid Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
              initial={{ opacity: 0 }}
              animate={{
                opacity: showColorVersion ? 1 : 0,
              }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface YidVidLoadingAnimationProps {
  isVisible: boolean;
  progress?: number;
  onComplete?: () => void;
}

export const YidVidLoadingAnimation: React.FC<YidVidLoadingAnimationProps> = ({
  isVisible,
  progress = 0,
  onComplete
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show logo after a brief delay
      const logoTimer = setTimeout(() => setShowLogo(true), 300);
      
      // Animate progress smoothly
      const progressTimer = setTimeout(() => {
        setAnimationProgress(progress);
      }, 600);

      // Auto complete after progress reaches 100%
      if (progress >= 100) {
        const completeTimer = setTimeout(() => {
          onComplete?.();
        }, 800);
        return () => clearTimeout(completeTimer);
      }

      return () => {
        clearTimeout(logoTimer);
        clearTimeout(progressTimer);
      };
    }
  }, [isVisible, progress, onComplete]);

  const logoVariants = {
    hidden: { 
      scale: 0.5, 
      opacity: 0,
      rotate: -180
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    },
    exit: {
      scale: 1.2,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const progressBarVariants = {
    hidden: { 
      width: "0%",
      opacity: 0
    },
    visible: { 
      width: `${animationProgress}%`,
      opacity: 1,
      transition: {
        width: {
          duration: 2,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.3
        }
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex flex-col items-center space-y-8">
            {/* Logo Container */}
            <motion.div
              className="relative"
              variants={logoVariants}
              initial="hidden"
              animate={showLogo ? "visible" : "hidden"}
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                {/* Subtle glow effect behind logo */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150" />
                
                {/* Logo */}
                <img 
                  src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
                  alt="YidVid"
                  className="relative z-10 w-full h-full object-contain drop-shadow-lg"
                  onError={(e) => {
                    // Fallback to colored circle if logo fails
                    const target = e.currentTarget.parentElement;
                    if (target) {
                      target.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">Y</div>';
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Progress Bar Container */}
            <div className="w-64 md:w-80">
              {/* Progress Track */}
              <div className="relative h-1 bg-muted rounded-full overflow-hidden">
                {/* Animated Progress Bar */}
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  variants={progressBarVariants}
                  initial="hidden"
                  animate="visible"
                />
                
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: [-32, 256],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 1
                  }}
                />
              </div>
              
              {/* Loading Text */}
              <motion.div
                className="text-center mt-4 text-sm text-muted-foreground font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                Loading your videos...
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
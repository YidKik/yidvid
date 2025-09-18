import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { YouTubeStyleLoading } from "../YouTubeStyleLoading";
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

  useEffect(() => {
    if (isVisible) {      
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
        clearTimeout(progressTimer);
      };
    }
  }, [isVisible, progress, onComplete]);

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
          <div className="flex flex-col items-center space-y-6">
            {/* YouTube-style loading animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <YouTubeStyleLoading size="large" />
            </motion.div>

            {/* Loading Text */}
            <motion.div
              className="text-center text-muted-foreground font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Loading your videos...
            </motion.div>

            {/* Progress indicator (optional visual feedback) */}
            <motion.div
              className="w-64 h-1 bg-muted rounded-full overflow-hidden"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(animationProgress, 100)}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React from "react";
import { motion } from "framer-motion";
import yidvidIcon from "@/assets/yidvid_logo_icon.png";
import { cn } from "@/lib/utils";

interface YouTubeStyleLoadingProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export const YouTubeStyleLoading: React.FC<YouTubeStyleLoadingProps> = ({
  size = "medium",
  className,
}) => {
  // Size configurations
  const sizeConfig = {
    small: { 
      containerWidth: 200, 
      logoSize: 28, 
      lineHeight: 3,
      containerHeight: 60,
    },
    medium: { 
      containerWidth: 300, 
      logoSize: 36, 
      lineHeight: 4,
      containerHeight: 80,
    },
    large: { 
      containerWidth: 400, 
      logoSize: 48, 
      lineHeight: 5,
      containerHeight: 100,
    },
  };

  const config = sizeConfig[size];
  const gradientId = `youtube-gradient-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div 
        className="relative flex items-center"
        style={{ 
          width: config.containerWidth, 
          height: config.containerHeight 
        }}
      >
        {/* Logo that slides from center to left */}
        <motion.div
          className="absolute z-10 flex items-center justify-center rounded-full bg-background shadow-lg border"
          style={{
            width: config.logoSize + 8,
            height: config.logoSize + 8,
          }}
          initial={{ 
            left: "50%", 
            x: "-50%",
            scale: 1.2
          }}
          animate={{ 
            left: "0px", 
            x: "0%",
            scale: 1
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <img 
            src={yidvidIcon} 
            alt="YidVid Logo" 
            className="object-contain"
            style={{
              width: config.logoSize,
              height: config.logoSize
            }}
          />
        </motion.div>

        {/* Animated line that extends from the logo */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary via-primary to-transparent rounded-full"
          style={{ height: config.lineHeight }}
          initial={{ 
            width: 0,
            x: config.logoSize / 2 + 4
          }}
          animate={{ 
            width: [
              0,
              config.containerWidth - config.logoSize - 8,
              config.containerWidth - config.logoSize - 8,
              0
            ],
            x: config.logoSize / 2 + 4
          }}
          transition={{
            duration: 2.4,
            delay: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.6, 1]
          }}
        />

        {/* Pulsing gradient overlay on the line */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full overflow-hidden"
          style={{ 
            height: config.lineHeight,
            width: config.containerWidth - config.logoSize - 8,
            marginLeft: config.logoSize + 4
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            style={{ width: "40%" }}
            animate={{
              x: ["-100%", "350%"]
            }}
            transition={{
              duration: 1.8,
              delay: 1.1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Secondary glow effect */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-primary/20 rounded-full blur-sm"
          style={{ 
            height: config.lineHeight * 2,
            marginLeft: config.logoSize / 2 + 4
          }}
          initial={{ width: 0 }}
          animate={{ 
            width: [
              0,
              config.containerWidth - config.logoSize - 8,
              config.containerWidth - config.logoSize - 8,
              0
            ]
          }}
          transition={{
            duration: 2.4,
            delay: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.6, 1]
          }}
        />
      </div>
    </div>
  );
};
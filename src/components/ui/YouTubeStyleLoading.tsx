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
      containerHeight: 80,
    },
    medium: { 
      containerWidth: 300, 
      logoSize: 36, 
      lineHeight: 4,
      containerHeight: 100,
    },
    large: { 
      containerWidth: 400, 
      logoSize: 48, 
      lineHeight: 5,
      containerHeight: 120,
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
        {/* Logo with gentle pulse */}
        <motion.div
          className="absolute z-10 flex items-center justify-center rounded-full bg-white shadow-xl border-2 border-primary/20"
          style={{
            width: config.logoSize + 12,
            height: config.logoSize + 12,
            left: "50%",
            transform: "translateX(-50%)"
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1, 1, 0.95, 1],
            opacity: 1
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
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

        {/* Single smooth animated progress bar below logo */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 rounded-full overflow-hidden bg-gray-100"
          style={{ 
            height: config.lineHeight,
            width: config.containerWidth * 0.6,
            top: config.logoSize + 24
          }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-red-400 to-primary rounded-full"
            initial={{ x: "-100%" }}
            animate={{ 
              x: ["100%", "-100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};
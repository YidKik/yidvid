
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  useLoadingAnimations, 
  loadingSizeConfig, 
  loadingColorConfig,
  LoadingSize,
  LoadingColor
} from "@/hooks/useLoadingAnimations";
import { OrbitalCircles } from "./loading/OrbitalCircles";
import { CenterLogo } from "./loading/CenterLogo";
import { LoadingText } from "./loading/LoadingText";

interface LoadingAnimationProps {
  size?: LoadingSize;
  color?: LoadingColor;
  className?: string;
  text?: string;
}

export const LoadingAnimation = ({
  size = "medium",
  color = "accent",
  className,
  text
}: LoadingAnimationProps) => {
  const {
    containerVariants,
    circleVariants,
    logoVariants,
    textVariants,
    orbitalPositions
  } = useLoadingAnimations();

  const selectedSize = loadingSizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        className={cn(
          "relative flex items-center justify-center",
          selectedSize.container
        )}
        variants={containerVariants}
        animate="animate"
      >
        {/* Center logo component */}
        <CenterLogo 
          size={size} 
          color={color} 
          logoVariants={logoVariants}
        />

        {/* Orbital circles component */}
        <OrbitalCircles 
          size={size} 
          color={color} 
          orbitalPositions={orbitalPositions}
          circleVariants={circleVariants}
        />
      </motion.div>
      
      {/* Loading text component */}
      <LoadingText 
        text={text} 
        size={size} 
        textVariants={textVariants}
      />
    </div>
  );
};


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

interface LoadingAnimationProps {
  size?: LoadingSize;
  color?: LoadingColor;
  className?: string;
  text?: string;
}

export const LoadingAnimation = ({
  size = "medium",
  color = "primary",
  className,
  text
}: LoadingAnimationProps) => {
  const {
    spinnerVariants,
    textVariants,
  } = useLoadingAnimations();
  
  const selectedSize = loadingSizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        className={cn(
          "relative flex items-center justify-center",
          selectedSize.container
        )}
        initial="initial"
        animate="animate"
      >
        {/* Main spinner */}
        <motion.div 
          className={cn(
            "rounded-full border-t-transparent border-solid border-4",
            `border-${color}`,
            selectedSize.spinner
          )}
          variants={spinnerVariants}
        />
        
        {/* Inner spinner */}
        <motion.div 
          className={cn(
            "absolute rounded-full border-t-transparent border-solid border-2",
            `border-${color}/70`,
            selectedSize.innerSpinner
          )}
          variants={spinnerVariants}
          custom={1}
        />
        
        {/* Center dot with the logo */}
        <div className={cn(
          "absolute rounded-full bg-white",
          selectedSize.centerDot
        )}>
          {size !== "small" && (
            <img 
              src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" 
              alt="YidVid Logo"
              className={cn("object-contain", selectedSize.logoSize)}
              onError={(e) => {
                // If logo fails to load, don't show anything rather than a fallback
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      </motion.div>
      
      {/* Loading text */}
      {text && (
        <motion.div 
          className={cn(
            "mt-4 text-center text-muted-foreground", 
            selectedSize.fontSize
          )}
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          {text}
        </motion.div>
      )}
    </div>
  );
};

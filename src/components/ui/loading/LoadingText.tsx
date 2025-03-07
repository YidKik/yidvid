
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { loadingSizeConfig, LoadingSize } from "@/hooks/useLoadingAnimations";

interface LoadingTextProps {
  text?: string;
  size: LoadingSize;
  textVariants: any;
}

export const LoadingText: React.FC<LoadingTextProps> = ({
  text,
  size,
  textVariants
}) => {
  if (!text) return null;
  
  const selectedSize = loadingSizeConfig[size];

  return (
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
  );
};

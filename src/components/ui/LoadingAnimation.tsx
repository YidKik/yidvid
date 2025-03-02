
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
  text?: string;
}

export const LoadingAnimation = ({
  size = "medium",
  color = "accent",
  className,
  text
}: LoadingAnimationProps) => {
  // Map sizes to pixel values
  const sizeMap = {
    small: {
      container: "h-12 w-12",
      circle: 5,
      gap: 2
    },
    medium: {
      container: "h-16 w-16",
      circle: 6,
      gap: 3
    },
    large: {
      container: "h-24 w-24",
      circle: 8,
      gap: 4
    }
  };

  // Map colors to Tailwind classes
  const colorMap = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    muted: "bg-muted-foreground"
  };

  const selectedSize = sizeMap[size];
  const circleColor = colorMap[color];

  // Animation variants
  const circleVariants = {
    initial: { scale: 0.7, opacity: 0.5 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.4,
        yoyo: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        className={cn("relative flex items-center justify-center", selectedSize.container)}
      >
        {[...Array(4)].map((_, index) => {
          const angle = index * (Math.PI / 2); // 90-degree spacing (4 circles)
          const x = Math.cos(angle) * selectedSize.gap;
          const y = Math.sin(angle) * selectedSize.gap;

          return (
            <motion.div
              key={index}
              className={cn("absolute rounded-full", circleColor)}
              style={{
                width: selectedSize.circle,
                height: selectedSize.circle,
                x: `${x}rem`,
                y: `${y}rem`,
              }}
              variants={circleVariants}
              initial="initial"
              animate="animate"
              transition={{
                delay: index * 0.1, // Staggered animation
              }}
            />
          );
        })}
      </motion.div>
      
      {text && (
        <motion.div 
          className="mt-4 text-center text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.div>
      )}
    </div>
  );
};

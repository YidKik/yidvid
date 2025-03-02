
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
  // Size configurations
  const sizeMap = {
    small: {
      container: "h-12 w-12",
      circle: 5,
      gap: 2,
      fontSize: "text-xs"
    },
    medium: {
      container: "h-16 w-16",
      circle: 6,
      gap: 3,
      fontSize: "text-sm"
    },
    large: {
      container: "h-24 w-24",
      circle: 9,
      gap: 4,
      fontSize: "text-base"
    }
  };

  // Color configurations - using gradients for more depth
  const colorMap = {
    primary: "from-primary to-primary/80",
    secondary: "from-secondary to-secondary/80",
    accent: "from-accent to-accent/80",
    muted: "from-muted-foreground to-muted-foreground/50"
  };

  const selectedSize = sizeMap[size];
  const selectedColor = colorMap[color];

  // Container animation
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 8,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  // Circle animation with staggered delays for orbital effect
  const circleVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: (i: number) => ({
      scale: [0.8, 1.2, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
        delay: i * 0.2, // Staggered delay based on index
      }
    })
  };

  // Text fade-in animation
  const textVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.3
      }
    }
  };

  // Create dots in orbital positions
  const orbitalPositions = [
    { angle: 0, delay: 0 },
    { angle: 45, delay: 0.1 },
    { angle: 90, delay: 0.2 },
    { angle: 135, delay: 0.3 },
    { angle: 180, delay: 0.4 },
    { angle: 225, delay: 0.5 },
    { angle: 270, delay: 0.6 },
    { angle: 315, delay: 0.7 }
  ];

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
        {/* Center pulse circle */}
        <motion.div
          className={cn(
            "absolute rounded-full bg-gradient-to-r z-10",
            selectedColor
          )}
          style={{
            width: selectedSize.circle * 1.5,
            height: selectedSize.circle * 1.5,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Orbital circles */}
        {orbitalPositions.map((pos, index) => {
          const radians = (pos.angle * Math.PI) / 180;
          const x = Math.cos(radians) * selectedSize.gap;
          const y = Math.sin(radians) * selectedSize.gap;

          return (
            <motion.div
              key={index}
              className={cn(
                "absolute rounded-full bg-gradient-to-r",
                selectedColor
              )}
              style={{
                width: selectedSize.circle,
                height: selectedSize.circle,
                x: `${x}rem`,
                y: `${y}rem`,
              }}
              custom={index}
              variants={circleVariants}
              initial="initial"
              animate="animate"
            />
          );
        })}
      </motion.div>
      
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

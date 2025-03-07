
import { MotionProps } from "framer-motion";

// Helper function to generate orbital positions
export const generateOrbitalPositions = (count = 8) => {
  return Array.from({ length: count }).map((_, index) => {
    const angle = (index * 360) / count;
    const delay = index * 0.1;
    return { angle, delay };
  });
};

export const useLoadingAnimations = () => {
  // Container animation (orbit rotation)
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

  // Logo pulsing animation - gentle pulse without rotation
  const logoVariants = {
    initial: { scale: 0.95, opacity: 0.9 },
    animate: {
      scale: [0.95, 1.05, 0.95],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
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

  return {
    containerVariants,
    circleVariants,
    logoVariants,
    textVariants,
    orbitalPositions: generateOrbitalPositions()
  };
};

// Size configuration for different loading sizes
export const loadingSizeConfig = {
  small: {
    container: "h-10 w-10", // Smaller overall container
    circle: 4, // Smaller orbital dots
    gap: 1.8, // Reduced orbital radius
    fontSize: "text-xs",
    logoSize: "h-6 w-6" // Logo size maintained
  },
  medium: {
    container: "h-14 w-14", // Smaller overall container
    circle: 5, // Smaller orbital dots
    gap: 2.5, // Reduced orbital radius
    fontSize: "text-sm",
    logoSize: "h-9 w-9" // Increased logo size
  },
  large: {
    container: "h-20 w-20", // Smaller overall container
    circle: 6, // Smaller orbital dots
    gap: 3.5, // Reduced orbital radius
    fontSize: "text-base",
    logoSize: "h-14 w-14" // Increased logo size
  }
};

// Color configuration for different themes
export const loadingColorConfig = {
  primary: "from-primary to-primary/80",
  secondary: "from-secondary to-secondary/80",
  accent: "from-accent to-accent/80",
  muted: "from-muted-foreground to-muted-foreground/50"
};

export type LoadingSize = keyof typeof loadingSizeConfig;
export type LoadingColor = keyof typeof loadingColorConfig;

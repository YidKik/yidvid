
import { MotionProps } from "framer-motion";

export const useLoadingAnimations = () => {
  // Spinner animation
  const spinnerVariants = {
    initial: { 
      opacity: 0,
      rotate: 0 
    },
    animate: (index: number = 0) => ({
      opacity: 1,
      rotate: 360,
      transition: {
        duration: 1.2,
        ease: "linear",
        repeat: Infinity,
        delay: index * 0.2
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

  return {
    spinnerVariants,
    textVariants
  };
};

// Size configuration for different loading sizes
export const loadingSizeConfig = {
  small: {
    container: "h-8 w-8",
    spinner: "h-8 w-8", 
    innerSpinner: "h-6 w-6",
    centerDot: "h-3 w-3",
    fontSize: "text-xs mt-2",
    logoSize: "h-3 w-3"
  },
  medium: {
    container: "h-12 w-12",
    spinner: "h-12 w-12",
    innerSpinner: "h-9 w-9",
    centerDot: "h-5 w-5 flex items-center justify-center",
    fontSize: "text-sm",
    logoSize: "h-4 w-4"
  },
  large: {
    container: "h-20 w-20",
    spinner: "h-20 w-20",
    innerSpinner: "h-16 w-16",
    centerDot: "h-8 w-8 flex items-center justify-center",
    fontSize: "text-base",
    logoSize: "h-6 w-6"
  }
};

// Color configuration for different themes
export const loadingColorConfig = {
  primary: "primary",
  secondary: "secondary",
  accent: "accent",
  muted: "muted-foreground"
};

export type LoadingSize = keyof typeof loadingSizeConfig;
export type LoadingColor = keyof typeof loadingColorConfig;

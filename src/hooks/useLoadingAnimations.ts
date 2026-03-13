
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
    container: "h-12 w-12",
    spinner: "h-12 w-12", 
    innerSpinner: "h-9 w-9",
    centerDot: "h-6 w-6 flex items-center justify-center",
    fontSize: "text-xs mt-2",
    logoSize: "h-6 w-6",
    circle: "0.5rem", // Add circle size for OrbitalCircles and CenterLogo
    gap: "1.5rem"      // Add gap for OrbitalCircles
  },
  medium: {
    container: "h-20 w-20",
    spinner: "h-20 w-20",
    innerSpinner: "h-14 w-14",
    centerDot: "h-10 w-10 flex items-center justify-center",
    fontSize: "text-sm",
    logoSize: "h-8 w-8",
    circle: "0.75rem", // Add circle size for OrbitalCircles and CenterLogo
    gap: "2.5rem"      // Add gap for OrbitalCircles
  },
  large: {
    container: "h-32 w-32",
    spinner: "h-32 w-32",
    innerSpinner: "h-24 w-24",
    centerDot: "h-14 w-14 flex items-center justify-center",
    fontSize: "text-base",
    logoSize: "h-10 w-10",
    circle: "1rem",    // Add circle size for OrbitalCircles and CenterLogo
    gap: "3.5rem"      // Add gap for OrbitalCircles
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

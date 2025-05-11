
import React, { useState, useEffect } from "react";
import { GradientTracing } from "./gradient-tracing";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingSize, LoadingColor } from "@/hooks/useLoadingAnimations";
import { LoadingAnimation } from "./LoadingAnimation";

interface DelayedLoadingAnimationProps {
  size?: LoadingSize;
  color?: LoadingColor;
  text?: string;
  className?: string;
  delayMs?: number;
}

export const DelayedLoadingAnimation: React.FC<DelayedLoadingAnimationProps> = ({
  size = "medium",
  color = "primary",
  text,
  className,
  delayMs = 3000, // Default 3 second delay
}) => {
  const [showLoading, setShowLoading] = useState(false);
  const { isMobile } = useIsMobile();
  
  // Show loading animation immediately instead of waiting for a delay
  useEffect(() => {
    // Only show after a short delay instead of the longer one
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 100); // Reduced from delayMs to 100ms for immediate feedback
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!showLoading) {
    return null;
  }
  
  // Get color values based on the color prop
  const getGradientColors = (): [string, string, string] => {
    switch (color) {
      case "primary":
        return ["#2EB9DF", "#9b87f5", "#7E69AB"];
      case "secondary":
        return ["#8B5CF6", "#7c3aed", "#6d28d9"];
      case "accent":
        return ["#ea384c", "#f87171", "#fca5a5"];
      case "muted":
        return ["#94a3b8", "#64748b", "#475569"];
      default:
        return ["#2EB9DF", "#9b87f5", "#7E69AB"];
    }
  };
  
  // Adjust size based on mobile/desktop
  const actualSize = isMobile ? (size === "large" ? "medium" : (size === "medium" ? "small" : "small")) : size;
  
  // Path for circular loading animation
  const getPath = (size: LoadingSize): string => {
    const sizeMap = {
      small: { width: 150, height: 50, radius: 20 },
      medium: { width: 300, height: 80, radius: 30 },
      large: { width: 400, height: 120, radius: 40 },
    };
    
    const { width, height, radius } = sizeMap[size];
    const centerX = width / 2;
    const centerY = height / 2;
    
    return `M${centerX - radius},${centerY} a${radius},${radius} 0 1,1 ${radius * 2},0 a${radius},${radius} 0 1,1 -${radius * 2},0`;
  };

  // Use regular LoadingAnimation instead of GradientTracing for consistency
  return (
    <div className={cn("flex items-center justify-center my-4", className)}>
      <LoadingAnimation
        size={actualSize}
        color={color}
        text={text}
        className="py-6"
      />
    </div>
  );
};

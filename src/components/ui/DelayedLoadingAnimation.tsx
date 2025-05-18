
import React, { useState, useEffect } from "react";
import { GradientTracing } from "./gradient-tracing";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingSize, LoadingColor } from "@/hooks/useLoadingAnimations";

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
  
  // Only show loading animation after the specified delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, delayMs);
    
    return () => clearTimeout(timer);
  }, [delayMs]);
  
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

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <GradientTracing
        width={isMobile ? 150 : 300}
        height={isMobile ? 50 : 80}
        size={actualSize}
        text={text}
        gradientColors={getGradientColors()}
        path={getPath(actualSize)}
        animationDuration={3}
      />
    </div>
  );
};

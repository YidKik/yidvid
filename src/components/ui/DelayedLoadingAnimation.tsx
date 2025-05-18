
import React, { useState, useEffect } from "react";
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
  delayMs = 1000, // Default 1 second delay
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
  
  // Adjust size based on mobile/desktop
  const actualSize = isMobile ? (size === "large" ? "medium" : (size === "medium" ? "small" : "small")) : size;

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

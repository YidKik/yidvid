
import React from "react";
import { motion } from "framer-motion"; // Using framer-motion since it's already installed

interface GradientTracingProps {
  width: number;
  height: number;
  baseColor?: string;
  gradientColors?: [string, string, string];
  animationDuration?: number;
  strokeWidth?: number;
  path?: string;
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
}

export const GradientTracing: React.FC<GradientTracingProps> = ({
  width,
  height,
  baseColor = "#334155",
  gradientColors = ["#2EB9DF", "#9b87f5", "#7E69AB"],
  animationDuration = 2,
  strokeWidth = 2,
  path,
  size = "medium",
  text,
  className = "",
}) => {
  const gradientId = `pulse-${Math.random().toString(36).substring(2, 9)}`;
  
  // Default path is a horizontal line if not provided
  const defaultPath = `M0,${height / 2} L${width},${height / 2}`;
  const actualPath = path || defaultPath;
  
  // Size presets
  const sizeConfig = {
    small: { width: 150, height: 50, strokeWidth: 1.5, fontSize: "text-xs" },
    medium: { width: 300, height: 80, strokeWidth: 2, fontSize: "text-sm" },
    large: { width: 400, height: 120, strokeWidth: 3, fontSize: "text-base" },
  };
  
  // Apply size preset if provided
  const sizeProps = size ? sizeConfig[size] : null;
  const finalWidth = sizeProps ? sizeProps.width : width;
  const finalHeight = sizeProps ? sizeProps.height : height;
  const finalStrokeWidth = sizeProps ? sizeProps.strokeWidth : strokeWidth;
  const fontSize = sizeProps ? sizeProps.fontSize : "text-sm";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: finalWidth, height: finalHeight }}>
        <svg
          width={finalWidth}
          height={finalHeight}
          viewBox={`0 0 ${finalWidth} ${finalHeight}`}
          fill="none"
        >
          <path
            d={actualPath}
            stroke={baseColor}
            strokeOpacity="0.2"
            strokeWidth={finalStrokeWidth}
          />
          <path
            d={actualPath}
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeWidth={finalStrokeWidth}
          />
          <defs>
            <motion.linearGradient
              animate={{
                x1: [0, finalWidth * 2],
                x2: [0, finalWidth],
              }}
              transition={{
                duration: animationDuration,
                repeat: Infinity,
                ease: "linear",
              }}
              id={gradientId}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={gradientColors[0]} stopOpacity="0" />
              <stop stopColor={gradientColors[1]} />
              <stop offset="1" stopColor={gradientColors[2]} stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      {text && (
        <p className={`mt-3 ${fontSize} text-gray-600`}>{text}</p>
      )}
    </div>
  );
};

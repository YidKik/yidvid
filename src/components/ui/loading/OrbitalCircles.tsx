
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { loadingSizeConfig, LoadingSize, loadingColorConfig, LoadingColor } from "@/hooks/useLoadingAnimations";

interface OrbitalCirclesProps {
  size: LoadingSize;
  color: LoadingColor;
  orbitalPositions: Array<{ angle: number; delay: number }>;
  circleVariants: any;
}

export const OrbitalCircles: React.FC<OrbitalCirclesProps> = ({
  size,
  color,
  orbitalPositions,
  circleVariants
}) => {
  const selectedSize = loadingSizeConfig[size];
  const selectedColor = loadingColorConfig[color];

  return (
    <>
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
    </>
  );
};

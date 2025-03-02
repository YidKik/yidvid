
import React from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryLinesProps {
  borderColor: string;
}

export const CategoryLines = ({ borderColor }: CategoryLinesProps) => {
  const isMobile = useIsMobile();

  // Animation variants for the line animation effect
  const lineVariants = {
    initial: (custom: number) => ({
      height: isMobile ? custom * 0.7 : custom,
      opacity: 0.6,
    }),
    animate: (custom: number) => ({
      height: isMobile ? 
        [custom * 0.7, custom * 0.9, custom * 0.7] : 
        [custom, custom * 1.5, custom],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
        delay: custom * 0.05,
      },
    }),
  };

  if (isMobile) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex space-x-1 md:space-x-2">
        <motion.div 
          custom={isMobile ? 15 : 20}
          variants={lineVariants}
          initial="initial"
          animate="animate"
          className={`w-[1px] md:w-[3px] rounded-full`}
          style={{ 
            background: `linear-gradient(to bottom, ${borderColor}22, ${borderColor}88)` 
          }}
        />
        <motion.div 
          custom={isMobile ? 20 : 30}
          variants={lineVariants}
          initial="initial"
          animate="animate"
          className={`w-[1px] md:w-[3px] rounded-full`}
          style={{ 
            background: `linear-gradient(to bottom, ${borderColor}44, ${borderColor})` 
          }}
        />
        <motion.div 
          custom={isMobile ? 15 : 20}
          variants={lineVariants}
          initial="initial"
          animate="animate"
          className={`w-[1px] md:w-[3px] rounded-full`}
          style={{ 
            background: `linear-gradient(to bottom, ${borderColor}22, ${borderColor}88)` 
          }}
        />
      </div>
    </div>
  );
};

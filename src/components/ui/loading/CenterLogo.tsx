
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { loadingSizeConfig, LoadingSize, loadingColorConfig, LoadingColor } from "@/hooks/useLoadingAnimations";

interface CenterLogoProps {
  size: LoadingSize;
  color: LoadingColor;
  logoVariants: any;
}

export const CenterLogo: React.FC<CenterLogoProps> = ({
  size,
  color,
  logoVariants
}) => {
  const selectedSize = loadingSizeConfig[size];
  const selectedColor = loadingColorConfig[color];
  const circleSizeNum = parseFloat(selectedSize.circle);
  
  return (
    <motion.div
      className="absolute z-10 rounded-full bg-white flex items-center justify-center overflow-hidden"
      style={{
        width: `${circleSizeNum * 3.2}rem`, // Larger center for logo
        height: `${circleSizeNum * 3.2}rem`, // Larger center for logo
      }}
      variants={logoVariants}
      initial="initial"
      animate="animate"
    >
      <img 
        src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
        alt="YidVid Logo"
        className={cn("object-contain", selectedSize.logoSize)}
        onError={(e) => {
          console.error('Logo failed to load:', e);
          // Fallback to a colored circle if logo fails to load
          const target = e.currentTarget.parentElement;
          if (target) {
            target.innerHTML = '';
            target.className = cn(
              target.className,
              "bg-gradient-to-r",
              selectedColor
            );
          }
        }}
      />
    </motion.div>
  );
};

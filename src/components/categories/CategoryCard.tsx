
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { CategoryIcon } from "./CategoryIcon";
import { CategoryLabel } from "./CategoryLabel";
import { CategoryLines } from "./CategoryLines";

interface CategoryCardProps {
  icon: string;
  label: string;
  id: string;
  isCustomImage?: boolean;
}

// Using the primary color for all categories
const categoryColors = {
  bg: '#FFFFFF',
  border: '#ea384c',
  text: '#333333',
  iconBg: '#ea384c'
};

export const CategoryCard = ({ icon, label, id, isCustomImage = false }: CategoryCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Debug log to check props
  useEffect(() => {
    console.log(`CategoryCard rendering for: ${label} (${id}) with icon: ${icon}`);
  }, [label, id, icon]);

  const handleClick = () => {
    console.log(`Navigating to category: ${id}`);
    navigate(`/category/${id}`);
  };

  return (
    <motion.div
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        borderColor: "#d6293d",
        scale: 1.02,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 15
        }
      }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl p-1 md:p-3 cursor-pointer transition-all duration-300 ${isMobile ? 'h-[55px]' : 'h-[90px]'} relative backdrop-blur-sm flex items-center`}
      style={{
        background: categoryColors.bg,
        border: `1.5px solid ${categoryColors.border}`,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
      onClick={handleClick}
    >
      <div className="flex items-center h-full w-full px-1">
        <div className="flex items-center gap-1 md:gap-2 flex-1">
          <CategoryIcon 
            icon={icon} 
            isCustomImage={isCustomImage} 
            iconBgColor={categoryColors.iconBg} 
          />
          <CategoryLabel 
            label={label} 
            textColor={categoryColors.text} 
          />
        </div>
        
        {/* Animated decorative lines for right side - only show on desktop */}
        <CategoryLines borderColor={categoryColors.border} />
      </div>
    </motion.div>
  );
};

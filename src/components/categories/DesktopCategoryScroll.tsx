
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CategoryCard } from "./CategoryCard";

interface DesktopCategoryScrollProps {
  infiniteCategories: Array<{
    id: string;
    label: string;
    icon: string;
    isCustom?: boolean;
    is_emoji?: boolean;
  }>;
}

export const DesktopCategoryScroll: React.FC<DesktopCategoryScrollProps> = ({ 
  infiniteCategories 
}) => {
  // Debug log to help diagnose issues
  useEffect(() => {
    console.log(`DesktopCategoryScroll rendering with ${infiniteCategories?.length || 0} categories`);
    if (infiniteCategories?.[0]) {
      console.log("First category:", infiniteCategories[0]);
    }
  }, [infiniteCategories]);

  // Guard against empty categories
  if (!infiniteCategories || infiniteCategories.length === 0) {
    console.warn("No categories available to display in desktop scroll");
    return null;
  }

  return (
    <div className="w-full h-full flex items-center overflow-hidden">
      <motion.div
        className="flex gap-2 md:gap-4 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{
          left: -(infiniteCategories.length * 120),
          right: 0
        }}
        dragElastic={0.2}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        initial={{ x: 0 }}
        animate={{
          x: [0, -(infiniteCategories.length * 100)]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 120,
            ease: "linear",
            repeatDelay: 0
          }
        }}
        style={{
          width: `${(infiniteCategories.length * 100) / 3}%`,
          minWidth: "900px"
        }}
        whileTap={{ cursor: "grabbing" }}
      >
        {infiniteCategories.map((category, index) => (
          <div
            key={`${category.id}-${index}`}
            className="w-[95px] md:w-[220px] flex-shrink-0 relative"
          >
            <CategoryCard
              id={category.id}
              icon={category.icon}
              label={category.label}
              isCustomImage={category.isCustom && !category.is_emoji}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

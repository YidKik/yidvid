
import React from "react";
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
  return (
    <motion.div
      className="flex gap-2 md:gap-4 cursor-grab active:cursor-grabbing"
      drag="x"
      dragConstraints={{
        left: -(infiniteCategories.length * 300),
        right: 0
      }}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      animate={{
        x: ['0%', '-50%']
      }}
      transition={{
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 180,
          ease: "linear",
          repeatDelay: 0
        }
      }}
      style={{
        width: `${(infiniteCategories.length * 100) / 3}%`
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
  );
};

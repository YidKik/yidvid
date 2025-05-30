
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All Videos' },
  { id: 'music', label: 'Music' },
  { id: 'torah', label: 'Torah' },
  { id: 'inspiration', label: 'Inspiration' },
  { id: 'podcast', label: 'Podcasts' },
  { id: 'education', label: 'Education' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'other', label: 'Other' },
];

export const CategorySelector = ({ selectedCategory, onCategoryChange }: CategorySelectorProps) => {
  return (
    <div className="w-full">
      <div className="relative flex flex-wrap gap-1 justify-center p-2 bg-gray-100 rounded-full shadow-inner max-w-4xl mx-auto">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20",
              selectedCategory === category.id
                ? "bg-white text-primary shadow-md z-10"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">{category.label}</span>
            {selectedCategory === category.id && (
              <motion.div
                className="absolute inset-0 bg-white rounded-full shadow-md"
                layoutId="activeCategory"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

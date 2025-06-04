
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
      <div className="relative flex flex-nowrap gap-1 justify-center p-2 bg-transparent rounded-full shadow-lg border border-primary/20 max-w-4xl mx-auto overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-visible category-selector-mobile">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "relative px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ease-in-out flex-shrink-0",
              "focus:outline-none whitespace-nowrap",
              selectedCategory === category.id
                ? "bg-primary text-white shadow-md z-10"
                : "text-gray-600 bg-transparent"
            )}
            style={{
              minWidth: 'auto',
              fontSize: window.innerWidth <= 768 ? '0.6rem' : '0.75rem',
              padding: window.innerWidth <= 768 ? '0.25rem 0.5rem' : '0.375rem 0.75rem'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">{category.label}</span>
            {selectedCategory === category.id && (
              <motion.div
                className="absolute inset-0 bg-primary rounded-full shadow-md"
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

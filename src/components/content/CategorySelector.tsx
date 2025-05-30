
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All Videos', icon: '🎬' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'torah', label: 'Torah', icon: '📖' },
  { id: 'inspiration', label: 'Inspiration', icon: '✨' },
  { id: 'podcast', label: 'Podcasts', icon: '🎙️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '📌' },
];

export const CategorySelector = ({ selectedCategory, onCategoryChange }: CategorySelectorProps) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 justify-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              "hover:scale-105 hover:shadow-md",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-base">{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
            <span className="sm:hidden">{category.label.split(' ')[0]}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryToggleProps {
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

export const CategoryToggle = ({ selectedCategory, onCategoryChange }: CategoryToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useIsMobile();

  const toggleCategories = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleCategories}
        className={cn(
          "h-8 w-8 p-0 rounded-lg transition-all duration-300",
          "hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200",
          isOpen ? "bg-red-50 text-red-600 border-red-200" : "text-gray-500"
        )}
      >
        <Filter className="h-4 w-4" />
      </Button>

      {/* Categories Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute top-full mt-2 z-50 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl overflow-hidden",
              "bg-white/95 dark:bg-gray-900/95",
              isMobile 
                ? "left-1/2 -translate-x-1/2 w-48" // Centered on mobile
                : "left-0 w-56" // Left aligned on desktop
            )}
          >
            <div className="p-2 space-y-1">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-red-50 hover:text-red-600",
                    selectedCategory === category.id
                      ? "bg-red-500 text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.label}
                  {selectedCategory === category.id && (
                    <motion.div
                      className="ml-auto inline-block w-2 h-2 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible backdrop for click outside */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
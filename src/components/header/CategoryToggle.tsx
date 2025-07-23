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
          "hover:bg-accent/50 hover:text-accent-foreground",
          isOpen ? "bg-accent text-accent-foreground" : "text-muted-foreground"
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
              "absolute top-full mt-2 z-50 bg-background/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-lg overflow-hidden",
              isMobile 
                ? "right-0 w-48" 
                : "left-1/2 -translate-x-1/2 w-56"
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
                    "hover:bg-accent/50 hover:text-accent-foreground",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.label}
                  {selectedCategory === category.id && (
                    <motion.div
                      className="ml-auto inline-block w-2 h-2 bg-primary-foreground rounded-full"
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

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
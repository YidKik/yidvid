
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { isMobile } = useIsMobile();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setHasScrolled(scrolled);
      
      // Show after user has scrolled a bit
      if (scrolled && !isVisible) {
        setTimeout(() => setIsVisible(true), 300);
      } else if (!scrolled) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  return (
    <div className="w-full">
      <motion.div 
        className={cn(
          "relative flex gap-1 justify-center p-2 rounded-lg shadow-lg border border-primary/20 mx-auto overflow-x-auto scrollbar-hide",
          isMobile 
            ? "flex-nowrap max-w-full px-2" 
            : "flex-wrap max-w-3xl bg-card/90 backdrop-blur-sm"
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: isMobile || isVisible ? 1 : 0,
          y: isMobile || isVisible ? 0 : -20 
        }}
        transition={{ 
          duration: 0.5, 
          ease: "easeOut" 
        }}
      >
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "relative rounded-lg font-semibold transition-all duration-300 ease-in-out flex-shrink-0 border-2",
              "focus:outline-none whitespace-nowrap",
              isMobile 
                ? "px-2 py-1 text-xs" 
                : "px-4 py-2 text-sm min-w-[100px]",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                : "text-muted-foreground bg-background/80 border-border/50 hover:border-primary/50 hover:bg-primary/5"
            )}
            whileTap={{ scale: isMobile ? 0.95 : 0.98 }}
            whileHover={{ scale: selectedCategory === category.id ? 1.05 : 1.02 }}
          >
            <span className="relative z-10 font-bold">{category.label}</span>
            {selectedCategory === category.id && (
              <motion.div
                className="absolute inset-0 bg-primary rounded-lg shadow-lg"
                layoutId="activeCategory"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

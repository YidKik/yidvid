
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, Filter } from "lucide-react";

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
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setHasScrolled(scrolled);
      
      // Show after user has scrolled a bit and keep visible
      if (scrolled && !isVisible) {
        setTimeout(() => setIsVisible(true), 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  if (isHidden) {
    return (
      <div className="w-full flex justify-center mb-4">
        <motion.button
          onClick={() => setIsHidden(false)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full border border-primary/30 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Show Categories</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div 
        className={cn(
          "relative flex gap-2 justify-center p-3 rounded-2xl shadow-md border border-primary/20 mx-auto overflow-x-auto scrollbar-hide",
          isMobile 
            ? "flex-nowrap max-w-full px-2" 
            : "flex-nowrap max-w-fit bg-card/90 backdrop-blur-sm"
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
        {/* Hide button */}
        <motion.button
          onClick={() => setIsHidden(true)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 z-20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-3 w-3" />
        </motion.button>
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "relative rounded-2xl font-medium transition-all duration-300 ease-in-out flex-shrink-0 border",
              "focus:outline-none whitespace-nowrap",
              isMobile 
                ? "px-3 py-2 text-xs" 
                : "px-6 py-3 text-sm min-w-[100px]",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                : "text-muted-foreground bg-background/80 border-border/50 hover:border-primary/50 hover:bg-primary/5"
            )}
            whileTap={{ scale: isMobile ? 0.95 : 0.98 }}
            whileHover={{ scale: selectedCategory === category.id ? 1.05 : 1.02 }}
          >
            <span className="relative z-10 font-medium">{category.label}</span>
            {selectedCategory === category.id && (
              <motion.div
                className="absolute inset-0 bg-primary rounded-2xl shadow-lg"
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

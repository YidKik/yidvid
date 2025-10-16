import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const isVideosPage = location.pathname === "/videos";
  const isSearchPage = location.pathname === "/search";

  const toggleCategories = () => {
    setIsOpen(!isOpen);
  };

  // Match the header icon button styling
  const buttonClass = `h-9 w-9 rounded-full ${(isVideosPage || isSearchPage)
    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
    : 'bg-[#222222] hover:bg-[#333333] text-white'}`;

  return (
    <>
      {/* Toggle Button - matches other header icons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleCategories}
        className={buttonClass}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>

      {/* Categories Slide-in Panel from Left */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="text-xl">×</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => {
                        onCategoryChange(category.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                        "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20",
                        selectedCategory === category.id
                          ? "bg-red-500 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:shadow-sm"
                      )}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.label}</span>
                        {selectedCategory === category.id && (
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                          />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
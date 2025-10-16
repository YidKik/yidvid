import { useState } from "react";
import { createPortal } from "react-dom";
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

      {/* Categories Slide-in Panel from Left - Rendered using Portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setIsOpen(false)}
              />

              {/* Slide-in Panel - compact size with blurred background and red outline */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-[80px] z-50 w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-r-3xl border-2 border-red-400"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-friendly font-semibold text-gray-900 dark:text-white">Categories</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-7 w-7 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <span className="text-lg text-red-500">×</span>
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    {categories.map((category) => (
                      <motion.button
                        key={category.id}
                        onClick={() => {
                          onCategoryChange(category.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-friendly font-medium transition-all duration-200",
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
                              className="w-1.5 h-1.5 bg-white rounded-full"
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
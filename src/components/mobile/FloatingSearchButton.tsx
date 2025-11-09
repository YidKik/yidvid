import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloatingSearchButtonProps {
  hasScrolled: boolean;
}

export const FloatingSearchButton = ({ hasScrolled }: FloatingSearchButtonProps) => {
  const { isMobile } = useIsMobile();

  const handleClick = () => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Wait for scroll to complete, then focus the search input
    setTimeout(() => {
      // Dispatch custom event to focus the search input
      const focusSearchEvent = new CustomEvent('focusSearchBar');
      document.dispatchEvent(focusSearchEvent);
    }, 500);
  };

  // Only show on mobile devices
  if (!isMobile) return null;

  return (
    <motion.button
      className="fixed bottom-20 right-4 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl z-40 hover:bg-primary/90 transition-colors"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: hasScrolled ? 1 : 0,
        scale: hasScrolled ? 1 : 0.5,
        y: hasScrolled ? 0 : 20
      }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      aria-label="Search videos"
    >
      <Search className="h-5 w-5" />
    </motion.button>
  );
};

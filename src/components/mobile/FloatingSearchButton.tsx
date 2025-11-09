import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloatingSearchButtonProps {
  hasScrolled: boolean;
}

export const FloatingSearchButton = ({ hasScrolled }: FloatingSearchButtonProps) => {
  const { isMobile } = useIsMobile();

  const handleClick = () => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Only show on mobile devices
  if (!isMobile) return null;

  return (
    <motion.button
      className="fixed bottom-24 right-4 p-2.5 bg-card/80 backdrop-blur-sm rounded-full shadow-lg z-40 hover:bg-card transition-colors"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: hasScrolled ? 1 : 0,
        scale: hasScrolled ? 1 : 0.5,
        y: hasScrolled ? 0 : 20
      }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      aria-label="Scroll to top"
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <path d="m18 15-6-6-6 6"/>
      </motion.svg>
    </motion.button>
  );
};

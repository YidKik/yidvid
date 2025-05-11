
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const ScrollToTopButton = () => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div 
      className="fixed bottom-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: hasScrolled ? 1 : 0,
        scale: hasScrolled ? 1 : 0.5,
        y: hasScrolled ? 0 : 20
      }}
      transition={{ duration: 0.3 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        whileHover={{ scale: 1.2 }}
        className="cursor-pointer text-primary"
      >
        <path d="m18 15-6-6-6 6"/>
      </motion.svg>
    </motion.div>
  );
};

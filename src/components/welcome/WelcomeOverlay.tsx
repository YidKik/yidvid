
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LogoAnimation } from "@/components/welcome/LogoAnimation";
import { WelcomeText } from "@/components/welcome/WelcomeText";
import { useWelcomeData } from "@/hooks/useWelcomeData";
import { useAuth } from "@/hooks/useAuth";

export const WelcomeOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { session } = useAuth();
  const { userName } = useWelcomeData(session);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-primary/5 via-white to-primary/5"
        >
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute left-10 top-1/4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute right-10 bottom-1/4 w-32 h-32 bg-accent/10 rounded-full blur-xl" />
          </motion.div>
          
          <div className="text-center space-y-6 relative">
            <LogoAnimation />
            <WelcomeText userName={userName} />
          </div>
          
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

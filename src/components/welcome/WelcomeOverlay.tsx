
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        >
          <div className="text-center space-y-6">
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

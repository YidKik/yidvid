
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LogoAnimation } from "@/components/welcome/LogoAnimation";
import { WelcomeText } from "@/components/welcome/WelcomeText";
import { useWelcomeData } from "@/hooks/useWelcomeData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Play } from "lucide-react";

export const EnhancedWelcomeOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState<'logo' | 'welcome' | 'features' | 'exit'>('logo');
  const { session } = useAuth();
  const { userName } = useWelcomeData(session);
  
  // Auto-progress through the welcome stages
  useEffect(() => {
    if (stage === 'logo') {
      const timer = setTimeout(() => setStage('welcome'), 2200);
      return () => clearTimeout(timer);
    }
    
    if (stage === 'welcome') {
      const timer = setTimeout(() => setStage('features'), 3000);
      return () => clearTimeout(timer);
    }
    
    if (stage === 'features') {
      const timer = setTimeout(() => setStage('exit'), 3500);
      return () => clearTimeout(timer);
    }
    
    if (stage === 'exit') {
      const timer = setTimeout(() => setIsVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Features to display
  const features = [
    { icon: <Play className="h-4 w-4" />, text: "Latest Jewish Videos" },
    { icon: <Check className="h-4 w-4" />, text: "Curated Content" },
    { icon: <ChevronRight className="h-4 w-4" />, text: "Easy Discovery" }
  ];

  // Allow skipping
  const handleSkip = () => {
    setStage('exit');
    // Store in localStorage that user has seen welcome
    localStorage.setItem('welcomeShown', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Background with animated gradients */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-primary/5 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Dynamic background elements */}
            <motion.div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute left-0 top-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  x: [-100, 100, -100], 
                  y: [-50, 50, -50]
                }}
                transition={{ duration: 25, repeat: Infinity, repeatType: "mirror" }}
              />
              <motion.div 
                className="absolute right-0 bottom-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  x: [100, -100, 100], 
                  y: [50, -50, 50]
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
              />
              <motion.div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-300/5 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.5, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
              />
            </motion.div>
            
            {/* Grid pattern overlay */}
            <motion.div 
              className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOHY2QzI2LjYwMSA2IDMwIDkuMzk5IDMwIDE4aDZaIiBmaWxsLW9wYWNpdHk9Ii41IiBmaWxsPSIjMDAwIi8+PC9nPjwvc3ZnPg==')]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.03 }}
              transition={{ duration: 2, delay: 1 }}
            />
          </motion.div>
          
          <div className="text-center space-y-6 relative w-full max-w-3xl px-4">
            {/* Logo Animation (Stage 1) */}
            <AnimatePresence>
              {stage === 'logo' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <LogoAnimation />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Welcome Text (Stage 2) */}
            <AnimatePresence>
              {stage === 'welcome' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <WelcomeText userName={userName} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Features Highlight (Stage 3) */}
            <AnimatePresence>
              {stage === 'features' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/40 backdrop-blur-lg p-8 rounded-xl shadow-xl border border-white/20"
                >
                  <motion.h2 
                    className="text-3xl font-bold mb-6 text-primary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Discover Amazing Content
                  </motion.h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-white/70 p-4 rounded-lg shadow-sm flex items-center gap-3"
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          {feature.icon}
                        </div>
                        <p className="font-medium">{feature.text}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6"
                  >
                    <Button 
                      onClick={handleSkip}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Let's Explore
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Exit Animation (Stage 4) */}
            <AnimatePresence>
              {stage === 'exit' && (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <motion.div 
                    className="absolute inset-0 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 20 }}
                    transition={{ duration: 1 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Skip button */}
          {stage !== 'exit' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleSkip}
              className="absolute bottom-6 right-6 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

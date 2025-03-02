
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export const WelcomeOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisitedWelcome');
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasVisitedWelcome', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Blur overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full mx-4 bg-white rounded-xl shadow-2xl ${
              isMobile ? 'max-w-[90%] max-h-[80vh] overflow-y-auto' : 'max-w-4xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Logo and content */}
            <div className={`${isMobile ? 'p-3' : 'p-8'}`}>
              <div className="flex justify-center mb-2">
                <motion.img
                  src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
                  alt="YidVid Logo"
                  className={`${isMobile ? 'w-12 h-12' : 'w-24 h-24'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 text-center"
              >
                <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>
                  Welcome to YidVid!
                </h2>
                
                <p className={`${isMobile ? 'text-xs' : 'text-base'} text-gray-600`}>
                  Your one-stop platform for Jewish content
                </p>

                <div className={`space-y-2 text-left ${isMobile ? 'text-xs' : 'text-base'}`}>
                  {isMobile ? (
                    <>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-800 text-xs">What YidVid Offers:</h3>
                        <ul className="space-y-1 text-gray-600">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            Free Jewish content
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            No subscription needed
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-800 text-xs">With an Account:</h3>
                        <ul className="space-y-1 text-gray-600">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            Save favorites
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            Personalized content
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800">What YidVid Offers:</h3>
                        <ul className="space-y-1.5 text-gray-600">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Access to curated Jewish content from trusted sources
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Free to use - no subscription required
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Browse videos without an account
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800">With a Free Account:</h3>
                        <ul className="space-y-1.5 text-gray-600">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Save favorite videos and create playlists
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Comment and interact with the community
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Personalized content recommendations
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Track your watch history
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleClose}
                    className={`w-full ${isMobile ? 'text-sm py-1.5' : 'py-6 text-lg'}`}
                  >
                    Start Exploring
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

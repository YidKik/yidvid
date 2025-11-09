import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface SiteMaintenancePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiteMaintenancePopup: React.FC<SiteMaintenancePopupProps> = ({ isOpen, onClose }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if this is a first-time visitor
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeMessage');
    if (!hasSeenWelcome && isOpen) {
      setShouldShow(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcomeMessage', 'true');
    setShouldShow(false);
    onClose();
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-gradient-to-br from-background via-background to-muted/30 border-2 border-primary/20 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-lg mx-auto relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-muted/80 hover:bg-muted transition-all duration-200 z-10 backdrop-blur-sm border border-border/50"
            aria-label="Close welcome message"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>

          {/* Content */}
          <div className="relative p-5 md:p-8">
            <div className="text-center space-y-4 md:space-y-5">
              {/* Icon */}
              <div className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>

              {/* Title */}
              <div className="space-y-1.5 md:space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome to YidVid!
                </h2>
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium">
                  Your destination for quality video content
                </p>
              </div>

              {/* Message */}
              <div className="space-y-3 md:space-y-4 bg-white/80 dark:bg-black/20 rounded-xl p-4 md:p-5 border border-border/50">
                <p className="text-sm md:text-base leading-relaxed text-gray-900 dark:text-gray-100 font-medium">
                  Thank you for visiting! We're excited to have you here as we continue building and enhancing your experience.
                </p>
                <p className="text-xs md:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  Our platform is actively growing with new features, improved video organization, and enhanced browsing capabilities. While we're making ongoing improvements, you can explore our curated collection of channels and videos right away.
                </p>
                <p className="text-xs md:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  Stay tuned for exciting updates coming soon!
                </p>
              </div>

              {/* Continue Button */}
              <motion.button
                onClick={handleClose}
                className="w-full mt-4 md:mt-6 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl font-semibold hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl border border-primary/20 text-sm md:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Exploring
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, Wrench } from 'lucide-react';

export const SiteImprovementNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this notification
    const dismissed = localStorage.getItem('site-improvement-notification-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show notification after 15 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Remember that user dismissed it
    localStorage.setItem('site-improvement-notification-dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.6 
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="relative bg-gradient-to-br from-white via-red-50/50 to-pink-50/30 backdrop-blur-sm border-2 border-red-200/60 rounded-3xl shadow-2xl overflow-hidden">
            {/* Animated background sparkles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="absolute"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-red-300/60" />
                </motion.div>
              ))}
            </div>

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </motion.button>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Header with animated icons */}
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-2 bg-red-100 rounded-full"
                >
                  <Wrench className="w-5 h-5 text-red-500" />
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                  className="p-2 bg-pink-100 rounded-full"
                >
                  <Heart className="w-5 h-5 text-pink-500 fill-current" />
                </motion.div>
              </div>

              {/* Message */}
              <div className="space-y-3">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-bold text-gray-800"
                >
                  We're Making Things Even Better! 🚀
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  Hi there! We're actively working on improving YidVid to give you the best experience possible. 
                  You might notice some changes as we add cool new features and make everything smoother.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-gray-600 font-medium flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                  Thanks for your patience and support!
                </motion.p>
              </div>

              {/* Animated progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="space-y-2"
              >
                <div className="text-xs text-gray-500 text-center">Making progress every day</div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "75%" }}
                    transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-red-400 to-pink-400 rounded-full"
                  />
                </div>
              </motion.div>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-100/20 via-transparent to-pink-100/20 pointer-events-none" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SiteMaintenancePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiteMaintenancePopup: React.FC<SiteMaintenancePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md mx-auto relative"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors duration-200 z-10"
            aria-label="Close notification"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>

          {/* Content */}
          <div className="p-6 pr-10">
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <motion.div
                  className="w-6 h-6 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-card-foreground">
                We're Making Improvements!
              </h2>

              {/* Message */}
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm leading-relaxed">
                  We're currently making changes to our site and are aware of a few problems. 
                </p>
                <p className="text-sm leading-relaxed">
                  You can still browse the channels and videos that have already been added. 
                  We're aware that videos are not getting updated right now, but this will be available shortly.
                </p>
              </div>

              {/* Continue Button */}
              <motion.button
                onClick={onClose}
                className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue Browsing
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
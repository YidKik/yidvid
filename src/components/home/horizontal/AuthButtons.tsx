
import React from 'react';
import { motion } from 'framer-motion';

interface AuthButtonsProps {
  currentSection: number;
  onCreateAccountClick: () => void;
  onLoginClick: () => void;
}

export const AuthButtons = ({ currentSection, onCreateAccountClick, onLoginClick }: AuthButtonsProps) => {
  return (
    <motion.div 
      className="flex gap-6 mb-8"
      initial={{ opacity: 0, x: 50 }}
      animate={currentSection >= 2 ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <button
        onClick={onCreateAccountClick}
        className="px-8 py-4 bg-transparent border-2 border-[#77b0aa] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] hover:text-[#003c43] transition-colors"
      >
        Create account
      </button>
      <button
        onClick={onLoginClick}
        className="px-8 py-4 bg-transparent border-2 border-[#77b0aa] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] hover:text-[#003c43] transition-colors"
      >
        Login
      </button>
    </motion.div>
  );
};

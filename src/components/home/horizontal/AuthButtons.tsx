
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
      className="flex flex-col gap-8"
      initial={{ opacity: 0, x: 50 }}
      animate={currentSection >= 2 ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <button
        onClick={onCreateAccountClick}
        className="w-80 py-6 bg-transparent border-2 border-[#77b0aa] text-[#e3fef7] rounded-2xl text-xl font-medium hover:bg-[#77b0aa] hover:text-[#003c43] transition-colors"
      >
        Create Account
      </button>
      <button
        onClick={onLoginClick}
        className="w-80 py-6 bg-transparent border-2 border-[#77b0aa] text-[#e3fef7] rounded-2xl text-xl font-medium hover:bg-[#77b0aa] hover:text-[#003c43] transition-colors"
      >
        Login
      </button>
    </motion.div>
  );
};

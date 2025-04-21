
import React from 'react';
import { motion } from 'framer-motion';

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <motion.div 
        className="text-center p-8 bg-white shadow-lg rounded-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Our App
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          A simple and elegant application experience
        </p>
        <motion.button
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HomePage;


import React from 'react';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <motion.footer 
      className="bg-[#135d66] py-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-center space-x-10 mb-12">
          {['Contact', 'Send feedback', 'Request channel'].map((text) => (
            <button
              key={text}
              className="px-14 py-5 rounded-3xl border-2 border-[#ddf9f2] text-[#ddf9f2] text-xl hover:bg-[#003c43]/30 transition-all duration-300"
            >
              {text}
            </button>
          ))}
        </div>
        <p className="text-center text-[#ddf9f2] text-lg mt-8">All rights reserved @YidVid</p>
      </div>
    </motion.footer>
  );
};

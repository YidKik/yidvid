
import React from 'react';
import { motion } from 'framer-motion';

interface FeedbackCarouselProps {
  currentSection: number;
}

export const FeedbackCarousel = ({ currentSection }: FeedbackCarouselProps) => {
  const feedbackData = [
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-"
    },
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-"
    },
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-"
    }
  ];

  return (
    <motion.div 
      className="w-full max-w-2xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={currentSection >= 2 ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <motion.div 
        className="flex gap-6"
        animate={{ x: [0, -400, -800, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        {[...feedbackData, ...feedbackData].map((feedback, index) => (
          <div
            key={index}
            className="bg-transparent border-2 border-[#77b0aa] rounded-2xl p-6 w-80 h-32 flex-shrink-0"
          >
            <p className="text-[#e3fef7] text-sm leading-relaxed">{feedback.text}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

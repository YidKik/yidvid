
import React from 'react';
import { motion } from 'framer-motion';

interface FeedbackCarouselProps {
  currentSection: number;
}

export const FeedbackCarousel = ({ currentSection }: FeedbackCarouselProps) => {
  const feedbackData = [
    {
      text: "Real feedback from our amazing users about their experience with YidVid and the quality content we provide daily."
    },
    {
      text: "Real feedback showcasing how YidVid has become an essential platform for Jewish families worldwide seeking kosher entertainment."
    },
    {
      text: "Real feedback highlighting the dedication our team puts into curating the finest Jewish content for our community."
    }
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 h-1/2 overflow-hidden flex items-center bg-transparent"
      initial={{ opacity: 0 }}
      animate={currentSection >= 2 ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <motion.div 
        className="flex gap-12"
        animate={{ x: [0, -800, -1600, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {[...feedbackData, ...feedbackData, ...feedbackData, ...feedbackData].map((feedback, index) => (
          <div
            key={index}
            className="bg-transparent border-2 border-[#77b0aa] rounded-2xl p-10 w-[500px] h-48 flex-shrink-0 flex items-center"
          >
            <p className="text-[#e3fef7] text-lg leading-relaxed">{feedback.text}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

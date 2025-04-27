
import React from 'react';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

const feedbackItems = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
];

export const MobileFeedbackSection = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="mt-12 mb-8"
    >
      <h2 className="text-[#e3fef7] text-2xl font-bold text-center mb-6">Feedback</h2>
      
      <div className="relative">
        <div className="overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
          <div className="flex gap-4">
            {feedbackItems.map((feedback, index) => (
              <div 
                key={index}
                className="w-[66vw] flex-shrink-0 first:ml-4 last:mr-4"
              >
                <div className="border border-[#ddf9f2] rounded-3xl p-5 bg-[#135d66] min-h-[120px] flex items-start">
                  <p className="text-[#e3fef7] text-sm leading-relaxed">
                    {feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-4">
          {feedbackItems.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#e3fef7]' : 'bg-[#77b0aa]'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

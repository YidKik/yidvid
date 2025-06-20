
import React from 'react';
import { motion } from 'framer-motion';

export const FeedbackSection = () => {
  const feedbackData = [
    { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-" },
    { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-" },
    { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-" },
    { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-" }
  ];

  return (
    <section className="bg-[#003c43] py-16">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-[#ddf9f2] text-center mb-12"
        >
          Feedback
        </motion.h2>
        
        <motion.div 
          className="w-full max-w-6xl mx-auto overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            className="flex gap-6"
            animate={{ x: [0, -400, -800, -1200, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...feedbackData, ...feedbackData].map((feedback, index) => (
              <div
                key={index}
                className="bg-transparent border-2 border-[#77b0aa] rounded-2xl p-6 w-80 h-32 flex-shrink-0 flex items-center"
              >
                <p className="text-[#e3fef7] text-sm leading-relaxed">{feedback.text}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
        
        <div className="flex justify-center space-x-6 mt-12">
          <button className="px-8 py-3 bg-[#135d66] border border-[#ddf9f2] text-[#e3fef7] rounded-full text-lg hover:bg-[#77b0aa] transition-colors">
            Contact
          </button>
          <button className="px-8 py-3 bg-[#135d66] border border-[#ddf9f2] text-[#e3fef7] rounded-full text-lg hover:bg-[#77b0aa] transition-colors">
            Send feedback
          </button>
          <button className="px-8 py-3 bg-[#135d66] border border-[#ddf9f2] text-[#e3fef7] rounded-full text-lg hover:bg-[#77b0aa] transition-colors">
            Request channel
          </button>
        </div>
      </div>
    </section>
  );
};

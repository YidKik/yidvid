
import React from 'react';
import { motion } from 'framer-motion';
import { NumberTicker } from '@/components/ui/number-ticker';

interface StatsAndActionsSectionProps {
  onContactClick: () => void;
  onRequestChannelClick: () => void;
  onSendFeedbackClick: () => void;
  onCreateAccountClick: () => void;
  onLoginClick: () => void;
}

export const StatsAndActionsSection: React.FC<StatsAndActionsSectionProps> = ({
  onContactClick,
  onRequestChannelClick,
  onSendFeedbackClick,
  onCreateAccountClick,
  onLoginClick,
}) => {
  const feedbackData = [
    { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-" },
    { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-" },
    { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-" }
  ];

  return (
    <div className="w-screen flex-shrink-0 bg-[#003c43] p-8 flex">
      {/* Left Side */}
      <div className="w-1/2 flex flex-col justify-center items-start pl-16">
        {/* Logo */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-64 h-48 bg-[#135d66] rounded-3xl flex items-center justify-center border-2 border-[#77b0aa]">
            <div className="w-32 h-24 bg-[#77b0aa] rounded-2xl flex items-center justify-center">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-[#003c43]"></div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="space-y-4 mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={onContactClick}
            className="block w-64 py-4 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] transition-colors"
          >
            Contact
          </button>
          <button 
            onClick={onSendFeedbackClick}
            className="block w-64 py-4 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] transition-colors"
          >
            Send feedback
          </button>
          <button
            onClick={onRequestChannelClick}
            className="block w-64 py-4 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] transition-colors"
          >
            Request channel
          </button>
        </motion.div>

        {/* Copyright */}
        <motion.p 
          className="text-[#e3fef7] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          All rights reserved @YidVid
        </motion.p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col justify-center items-end pr-16">
        {/* Stats Cards */}
        <motion.div 
          className="flex gap-8 mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-transparent border-2 border-[#77b0aa] rounded-3xl p-8 w-64 h-48 text-center">
            <p className="text-[#77b0aa] text-lg mb-2">Over</p>
            <div className="text-[#e3fef7] text-5xl font-bold mb-2">
              <NumberTicker value={10000} />
            </div>
            <p className="text-[#77b0aa] text-xl">Videos</p>
          </div>
          <div className="bg-transparent border-2 border-[#77b0aa] rounded-3xl p-8 w-64 h-48 text-center">
            <p className="text-[#77b0aa] text-lg mb-2">Over</p>
            <div className="text-[#e3fef7] text-5xl font-bold mb-2">
              <NumberTicker value={400} />
            </div>
            <p className="text-[#77b0aa] text-xl">Channels</p>
          </div>
        </motion.div>

        {/* Auth Buttons */}
        <motion.div 
          className="flex gap-6 mb-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
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

        {/* Feedback Cards Carousel */}
        <motion.div 
          className="w-full max-w-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
      </div>
    </div>
  );
};

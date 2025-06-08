
import React from 'react';
import { motion } from 'framer-motion';
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';

interface ActionButtonsProps {
  currentSection: number;
  onRequestChannelClick: () => void;
}

export const ActionButtons = ({ currentSection, onRequestChannelClick }: ActionButtonsProps) => {
  return (
    <motion.div 
      className="space-y-4 mb-8"
      initial={{ opacity: 0, x: -50 }}
      animate={currentSection >= 2 ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <ContactDialog />
      <button className="block w-64 py-4 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] transition-colors">
        Send feedback
      </button>
      <button
        onClick={onRequestChannelClick}
        className="block w-64 py-4 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] transition-colors"
      >
        Request channel
      </button>
      <RequestChannelDialog />
    </motion.div>
  );
};

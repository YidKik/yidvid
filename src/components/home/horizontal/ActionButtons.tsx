
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
      className="space-y-6 mb-8"
      initial={{ opacity: 0, x: -50 }}
      animate={currentSection >= 2 ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="w-80 py-6 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-xl font-medium hover:bg-[#77b0aa] transition-colors flex items-center justify-center">
        <ContactDialog />
      </div>
      <button className="block w-80 py-6 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-xl font-medium hover:bg-[#77b0aa] transition-colors">
        Send feedback
      </button>
      <div className="w-80 py-6 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-xl font-medium hover:bg-[#77b0aa] transition-colors flex items-center justify-center">
        <RequestChannelDialog />
      </div>
    </motion.div>
  );
};

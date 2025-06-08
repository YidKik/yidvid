
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
      className="space-y-8 mb-8"
      initial={{ opacity: 0, x: -50 }}
      animate={currentSection >= 2 ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Contact Button */}
      <div className="w-96 py-8 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-2xl font-medium hover:bg-[#77b0aa] transition-colors flex items-center justify-center cursor-pointer">
        <ContactDialog />
        <span className="ml-2">Contact</span>
      </div>

      {/* Send Feedback Button */}
      <button className="block w-96 py-8 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-2xl font-medium hover:bg-[#77b0aa] transition-colors">
        Send Feedback
      </button>

      {/* Request Channel Button */}
      <div className="w-96 py-8 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-2xl font-medium hover:bg-[#77b0aa] transition-colors flex items-center justify-center cursor-pointer">
        <RequestChannelDialog />
        <span className="ml-2">Request Channel</span>
      </div>
    </motion.div>
  );
};


import React from 'react';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';

export const MobileActionsSection = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="mt-8 space-y-3 mb-8"
    >
      <button 
        className="w-full py-4 text-base text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
      >
        Send feedback
      </button>
      <ContactDialog />
      <RequestChannelDialog />
    </motion.div>
  );
};

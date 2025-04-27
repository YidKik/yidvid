
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

export const MobileActionsSection = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="mt-8 space-y-3 mb-8"
    >
      <Button 
        variant="default" 
        className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
      >
        Send feedback
      </Button>
      <Button 
        variant="default" 
        className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
      >
        Contact
      </Button>
      <Button 
        variant="default" 
        className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
      >
        Request channel
      </Button>
    </motion.div>
  );
};

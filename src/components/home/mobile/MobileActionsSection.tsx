
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';
import { Button } from "@/components/ui/button";
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';

export const MobileActionsSection = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="mt-8 space-y-3 mb-8"
    >
      <Button 
        className="w-full py-4 text-base text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
        onClick={() => setIsContactOpen(true)}
      >
        Send feedback
      </Button>
      
      <Button 
        className="w-full py-4 text-base text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
        onClick={() => setIsContactOpen(true)}
      >
        Contact us
      </Button>
      
      <Button 
        className="w-full py-4 text-base text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
        onClick={() => setIsRequestChannelOpen(true)}
      >
        Request channel
      </Button>
      
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
      <RequestChannelDialog open={isRequestChannelOpen} onOpenChange={setIsRequestChannelOpen} />
    </motion.div>
  );
};

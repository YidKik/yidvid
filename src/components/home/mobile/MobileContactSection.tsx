
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';

export const MobileContactSection = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);

  return (
    <div id="contact-section" className="py-12">
      <motion.h2
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 0.8, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-2xl font-semibold text-[#e3fef7] text-center mb-4 sticky top-14 backdrop-blur-sm bg-[#003c43]/50 py-3"
      >
        Contact Us
      </motion.h2>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        transition={{ duration: 0.6 }}
        className="space-y-3"
      >
        <Button 
          variant="default" 
          className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
          onClick={() => setIsContactOpen(true)}
        >
          Send feedback
        </Button>
        
        <Button 
          variant="default" 
          className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
          onClick={() => setIsContactOpen(true)}
        >
          Contact
        </Button>
        
        <Button 
          variant="default" 
          className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
          onClick={() => setIsRequestChannelOpen(true)}
        >
          Request channel
        </Button>
      </motion.div>
      
      {/* Hidden dialogs that are triggered by the buttons */}
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
      <RequestChannelDialog open={isRequestChannelOpen} onOpenChange={setIsRequestChannelOpen} />
    </div>
  );
};

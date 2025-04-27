
import React from 'react';
import { motion } from 'framer-motion';
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';

export const Footer = () => {
  return (
    <motion.footer 
      id="contact-section"
      className="bg-[#135d66] py-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-center space-x-10 mb-12">
          <button
            onClick={() => {
              const element = document.querySelector('[data-trigger="contact-dialog"]') as HTMLButtonElement;
              if (element) element.click();
            }}
            className="px-14 py-5 rounded-3xl border-2 border-[#ddf9f2] text-[#ddf9f2] text-xl hover:bg-[#003c43]/30 transition-all duration-300"
          >
            Contact us
          </button>
          
          <button
            onClick={() => {
              const element = document.querySelector('[data-trigger="request-channel-dialog"]') as HTMLButtonElement;
              if (element) element.click();
            }}
            className="px-14 py-5 rounded-3xl border-2 border-[#ddf9f2] text-[#ddf9f2] text-xl hover:bg-[#003c43]/30 transition-all duration-300"
          >
            Request channel
          </button>
          
          <button
            className="px-14 py-5 rounded-3xl border-2 border-[#ddf9f2] text-[#ddf9f2] text-xl hover:bg-[#003c43]/30 transition-all duration-300"
          >
            Send feedback
          </button>
        </div>
        <p className="text-center text-[#ddf9f2] text-lg mt-8">
          © {new Date().getFullYear()} YidVid. All Rights Reserved.
        </p>
      </div>
      {/* Hidden dialogs that are triggered by the buttons */}
      <div className="hidden">
        <ContactDialog />
        <RequestChannelDialog />
      </div>
    </motion.footer>
  );
};

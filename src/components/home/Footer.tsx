
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';

export const Footer = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);

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
            onClick={() => setIsContactOpen(true)}
            className="px-14 py-5 rounded-3xl text-[#ddf9f2] text-xl transition-all duration-300"
          >
            Contact us
          </button>
          
          <button
            onClick={() => setIsRequestChannelOpen(true)}
            className="px-14 py-5 rounded-3xl text-[#ddf9f2] text-xl transition-all duration-300"
          >
            Request channel
          </button>
          
          <button
            onClick={() => setIsContactOpen(true)}
            className="px-14 py-5 rounded-3xl text-[#ddf9f2] text-xl transition-all duration-300"
          >
            Send feedback
          </button>
        </div>
        <p className="text-center text-[#ddf9f2] text-lg mt-8">
          © {new Date().getFullYear()} YidVid. All Rights Reserved.
        </p>
        <div className="text-center text-[#ddf9f2] text-sm mt-6 max-w-4xl mx-auto">
          <p className="font-semibold mb-2">Our Mission: Safe & Kosher Content</p>
          <p>
            YidVid is dedicated to providing a safe, manually-curated platform for kosher video content. We are actively working to ensure our site is compatible with all major content filters.
          </p>
          <p className="mt-2">
            <strong>For Filter Administrators:</strong> This site uses `youtube-nocookie.com` for video embeds to respect user privacy and improve filter compatibility. Please contact us for whitelisting or any technical questions.
          </p>
        </div>
      </div>
      {/* Hidden dialogs that are triggered by the buttons */}
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
      <RequestChannelDialog open={isRequestChannelOpen} onOpenChange={setIsRequestChannelOpen} />
    </motion.footer>
  );
};

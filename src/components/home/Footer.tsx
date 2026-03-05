
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';
import { Mail, Send, Tv } from 'lucide-react';

export const Footer = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);

  const footerButtons = [
    { label: 'Contact Us', icon: Mail, action: () => setIsContactOpen(true) },
    { label: 'Request Channel', icon: Tv, action: () => setIsRequestChannelOpen(true) },
    { label: 'Send Feedback', icon: Send, action: () => setIsContactOpen(true) },
  ];

  return (
    <motion.footer 
      id="contact-section"
      className="bg-gradient-to-b from-[#135d66] to-[#0e4a52] py-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-center gap-6 mb-14">
          {footerButtons.map(({ label, icon: Icon, action }) => (
            <motion.button
              key={label}
              onClick={action}
              className="group flex items-center gap-3 px-10 py-4 rounded-full border border-[#77b0aa]/30 text-[#ddf9f2] text-lg hover:bg-[#77b0aa]/10 hover:border-[#ddf9f2]/40 transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon className="w-5 h-5 text-[#77b0aa] group-hover:text-[#ddf9f2] transition-colors" />
              {label}
            </motion.button>
          ))}
        </div>

        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-[#ddf9f2] text-lg font-medium">
            © {new Date().getFullYear()} YidVid. All Rights Reserved.
          </p>
          <div className="h-px w-24 mx-auto bg-[#77b0aa]/30" />
          <p className="text-[#77b0aa] text-sm font-medium">Our Mission: Safe & Kosher Content</p>
          <p className="text-[#77b0aa]/70 text-sm leading-relaxed">
            YidVid is dedicated to providing a safe, manually-curated platform for kosher video content. 
            We are actively working to ensure our site is compatible with all major content filters.
          </p>
          <p className="text-[#77b0aa]/60 text-xs leading-relaxed">
            <strong>For Filter Administrators:</strong> This site uses youtube-nocookie.com for video embeds 
            to respect user privacy and improve filter compatibility. Please contact us for whitelisting or any technical questions.
          </p>
        </div>
      </div>
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
      <RequestChannelDialog open={isRequestChannelOpen} onOpenChange={setIsRequestChannelOpen} />
    </motion.footer>
  );
};

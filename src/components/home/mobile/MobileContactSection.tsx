
import React from 'react';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

export const MobileContactSection = () => {
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
        className="text-sm text-[#e3fef7] leading-relaxed space-y-4 bg-[#135d66] px-4 py-6"
      >
        <p className="text-center">
          Have questions or feedback? We'd love to hear from you!
        </p>
        <div className="flex flex-col items-center gap-4 mt-4">
          <a href="mailto:contact@yidvid.com" className="text-[#e3fef7] hover:underline">
            contact@yidvid.com
          </a>
          <p>
            Tel: (555) 123-4567
          </p>
        </div>
      </motion.div>
    </div>
  );
};

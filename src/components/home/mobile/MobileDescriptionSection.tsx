
import React from 'react';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

export const MobileDescriptionSection = () => {
  return (
    <div id="about-section">
      <motion.h2
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 0.8, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-2xl font-semibold text-[#e3fef7] text-center mb-4 sticky top-14 backdrop-blur-sm bg-[#003c43]/50 py-3"
      >
        About
      </motion.h2>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        transition={{ duration: 0.6 }}
        className="text-sm text-[#e3fef7] leading-relaxed space-y-4 bg-[#135d66] px-4 py-6"
      >
        <p>
          We understand the importance of providing a safe and enjoyable platform for individuals and families to access content that aligns with their values. Our team is dedicated to curating a diverse range of videos that cater to a wide audience, while ensuring that all content meets our strict guidelines.
        </p>
        
        <p>
          By offering a free platform for users to create an account and access our content, we aim to make it easy for everyone to enjoy the latest videos in a secure environment. Our commitment to staying up-to-date with the latest trends and updates ensures that we are always bringing you the best content available.
        </p>
        
        <p>
          At YidVid, we take pride in our attention to detail and commitment to providing top-quality video options for our users. We strive to maintain the highest level of standards in everything we do, so you can trust that you are getting nothing but the best when you visit our site. Thank you for choosing YidVid.
        </p>
      </motion.div>
    </div>
  );
};

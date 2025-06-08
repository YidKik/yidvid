
import React from 'react';
import { motion } from 'framer-motion';

interface AboutSectionProps {
  currentSection: number;
}

export const AboutSection = ({ currentSection }: AboutSectionProps) => {
  return (
    <motion.div 
      className="bg-[#135d66] mx-8 rounded-3xl p-12"
      initial={{ opacity: 0, y: 100 }}
      animate={currentSection >= 1 ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      <h2 className="text-[#e3fef7] text-6xl font-bold mb-8 text-center opacity-50">About</h2>
      
      <div className="space-y-6 text-[#e3fef7] max-w-6xl mx-auto">
        <p className="text-lg leading-relaxed">
          We understand the importance of providing a safe and enjoyable platform for individuals and families to access entertainment content that aligns with their values. Our team is dedicated to curating a diverse range of videos that cater to a wide audience, while ensuring that all content meets our strict guidelines for kosher entertainment.
        </p>
        
        <p className="text-lg leading-relaxed">
          By offering a free platform for users to create an account and access our content, we aim to make it easy for everyone to enjoy the latest videos in a secure environment. Our commitment to staying up-to-date with the latest trends and updates in the entertainment industry ensures that we are always bringing you the best content available.
        </p>
        
        <p className="text-lg leading-relaxed">
          At YidVid, we take pride in our attention to detail and commitment to providing top-quality entertainment options for our users. We strive to maintain the highest level of standards in everything we do, so you can trust that you are getting nothing but the best when you visit our site. Thank you for choosing YidVid as your go-to source for kosher entertainment content.
        </p>
      </div>
    </motion.div>
  );
};

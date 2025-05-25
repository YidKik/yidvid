
import React from 'react';
import { motion, useTransform } from 'framer-motion';

interface AboutSectionContentProps {
  scrollProgress: number;
}

export const AboutSectionContent: React.FC<AboutSectionContentProps> = ({ scrollProgress }) => {
  // About section slides out to the left - increased distance to ensure full slide-out
  const aboutTransformX = useTransform(() => -scrollProgress * 150); // Increased from 120 to 150
  const aboutOpacity = useTransform(() => Math.max(0, 1 - scrollProgress * 1.5)); // Faster fade-out

  return (
    <motion.div 
      style={{ 
        x: aboutTransformX, 
        opacity: aboutOpacity 
      }}
      className="absolute inset-0 flex items-center w-full"
    >
      <div className="w-full">
        <motion.div 
          style={{ 
            x: aboutTransformX, 
            opacity: aboutOpacity 
          }}
          className="mt-8 mb-6 bg-[#135d66] rounded-3xl p-12 mx-auto max-w-6xl"
        >
          <div className="grid grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-6xl font-display text-white">About</h2>
              <div className="space-y-6 text-lg text-white/90">
                <p>
                  We understand the importance of providing a safe and enjoyable platform
                  for individuals and families to access content that aligns with
                  their values. Our team is dedicated to curating a diverse range of videos that
                  cater to a wide audience, while ensuring that all content meets our strict
                  guidelines.
                </p>
                <p>
                  By offering a free platform for users to create an account and access our content,
                  we aim to make it easy for everyone to enjoy the latest videos in a
                  secure environment. Our commitment to staying up-to-date with the latest
                  trends and updates ensures that we are always
                  bringing you the best content available.
                </p>
                <p>
                  At YidVid, we take pride in our attention to detail and commitment to providing
                  top-quality video options for our users. We strive to maintain
                  the highest level of standards in everything we do, so you can trust that you
                  are getting nothing but the best when you visit our site. Thank you for
                  choosing YidVid as your go-to source for kosher Jewish content.
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <img
                src="/public/yidvid-logo.png"
                alt="YidVid Logo"
                className="w-[600px] h-[600px] object-contain"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

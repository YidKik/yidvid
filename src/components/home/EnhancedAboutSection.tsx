
import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { NumberTicker } from '@/components/ui/number-ticker';
import Auth from '@/pages/Auth';

export const EnhancedAboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Transform values for animations
  const aboutTextX = useTransform(scrollYProgress, [0.3, 0.7], [0, -100]);
  const aboutTextOpacity = useTransform(scrollYProgress, [0.3, 0.7], [1, 0]);
  const cardsY = useTransform(scrollYProgress, [0.3, 0.7], [100, 0]);
  const cardsOpacity = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <section ref={sectionRef} id="about-section" className="bg-[#135d66] px-6 py-16 relative overflow-hidden min-h-screen flex items-center">
      <div className="container mx-auto relative">
        {/* About Content - slides out to the left */}
        <motion.div 
          style={{ x: aboutTextX, opacity: aboutTextOpacity }}
          className="grid grid-cols-2 gap-12 items-center absolute inset-0"
        >
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
        </motion.div>

        {/* Stats and Auth Cards - slide up from bottom */}
        <motion.div 
          style={{ y: cardsY, opacity: cardsOpacity }}
          className="space-y-12 relative z-10"
        >
          <div className="grid grid-cols-2 gap-8">
            <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8">
              <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
              <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                <NumberTicker value={400} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
              </h3>
              <p className="text-[#77b0aa] text-4xl">Channels</p>
            </div>
            
            <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8">
              <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
              <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                <NumberTicker value={10000} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
              </h3>
              <p className="text-[#77b0aa] text-4xl">Videos</p>
            </div>
          </div>

          <div className="flex justify-between space-x-8">
            <button 
              onClick={() => handleAuthClick('signup')}
              className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-colors duration-300"
            >
              Create account
            </button>

            <button 
              onClick={() => handleAuthClick('signin')}
              className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-colors duration-300"
            >
              Login
            </button>
          </div>

          <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} initialTab={activeTab} />
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedAboutSection;

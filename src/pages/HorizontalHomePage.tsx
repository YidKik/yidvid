
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';
import { NumberTicker } from '@/components/ui/number-ticker';

const HorizontalHomePage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentSection, setCurrentSection] = useState(0);
  
  const controls = useAnimation();

  // Add horizontal scrolling class to body on mount
  useEffect(() => {
    document.documentElement.classList.add('home-page');
    document.body.classList.add('home-page');
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.documentElement.classList.remove('home-page');
      document.body.classList.remove('home-page');
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle scroll events for section detection
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      
      if (Math.abs(delta) > 50) {
        if (delta > 0 && currentSection < 2) {
          setCurrentSection(prev => prev + 1);
        } else if (delta < 0 && currentSection > 0) {
          setCurrentSection(prev => prev - 1);
        }
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, [currentSection]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSection < 2) {
        setCurrentSection(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentSection > 0) {
        setCurrentSection(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection]);

  const handleRequestChannelClick = () => {
    if (!session) {
      setAuthMode('signin');
      setIsAuthOpen(true);
    }
  };

  const handleCreateAccountClick = () => {
    setAuthMode('signup');
    setIsAuthOpen(true);
  };

  const handleLoginClick = () => {
    setAuthMode('signin');
    setIsAuthOpen(true);
  };

  const feedbackData = [
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-"
    },
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-"
    },
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-"
    }
  ];

  return (
    <div className="fixed inset-0 bg-[#003c43] overflow-hidden">
      {/* Horizontal container */}
      <motion.div 
        className="flex h-full"
        animate={{ x: `${-currentSection * 100}vw` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Section 1: Hero */}
        <div className="w-screen h-screen flex flex-col items-center justify-center text-center px-8 flex-shrink-0">
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-[#e3fef7] leading-tight mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Your Gateway to<br />
            <span className="whitespace-nowrap">Jewish Content</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-[#77b0aa] max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Watch, share, and connect with the finest Jewish content from around the world.
          </motion.p>
        </div>

        {/* Section 2: Features & About */}
        <div className="w-screen h-screen flex-shrink-0 bg-[#003c43] relative overflow-y-auto">
          {/* Feature Cards */}
          <div className="pt-20 pb-10">
            <div className="flex justify-center gap-8 mb-16">
              {[
                { title: "Free", description: "It doesn't cost anything to make an account and it doesn't cost anything to use it." },
                { title: "Kosher", description: "we are on are guidelines to make sure its 100 percent kosher" },
                { title: "Up to date", description: "Keeping the site up to date with every video that meets our guidelines" }
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  className="bg-[#135d66] border-2 border-[#77b0aa] rounded-3xl p-8 w-80 h-64"
                  initial={{ opacity: 0, x: 100 }}
                  animate={currentSection >= 1 ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <h3 className="text-[#e3fef7] text-3xl font-bold mb-4">{card.title}</h3>
                  <p className="text-[#e3fef7] text-sm leading-relaxed">{card.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* About Section */}
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
        </div>

        {/* Section 3: Stats & Actions */}
        <div className="w-screen h-screen flex-shrink-0 bg-[#003c43] p-8 flex">
          {/* Left Side */}
          <div className="w-1/2 flex flex-col justify-center items-start pl-16">
            {/* Logo */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={currentSection >= 2 ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="w-64 h-48 bg-[#135d66] rounded-3xl flex items-center justify-center border-2 border-[#77b0aa]">
                <div className="w-32 h-24 bg-[#77b0aa] rounded-2xl flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-[#003c43]"></div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="space-y-4 mb-8"
              initial={{ opacity: 0, x: -50 }}
              animate={currentSection >= 2 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ContactDialog />
              <button className="block w-64 py-4 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] transition-colors">
                Send feedback
              </button>
              <button
                onClick={handleRequestChannelClick}
                className="block w-64 py-4 bg-[#135d66] border-2 border-[#ddf9f2] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] transition-colors"
              >
                Request channel
              </button>
              <RequestChannelDialog />
            </motion.div>

            {/* Copyright */}
            <motion.p 
              className="text-[#e3fef7] text-sm"
              initial={{ opacity: 0 }}
              animate={currentSection >= 2 ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              All rights reserved @YidVid
            </motion.p>
          </div>

          {/* Right Side */}
          <div className="w-1/2 flex flex-col justify-center items-end pr-16">
            {/* Stats Cards */}
            <motion.div 
              className="flex gap-8 mb-8"
              initial={{ opacity: 0, y: -50 }}
              animate={currentSection >= 2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-transparent border-2 border-[#77b0aa] rounded-3xl p-8 w-64 h-48 text-center">
                <p className="text-[#77b0aa] text-lg mb-2">Over</p>
                <div className="text-[#e3fef7] text-5xl font-bold mb-2">
                  {currentSection >= 2 ? <NumberTicker value={10000} /> : '0'}
                </div>
                <p className="text-[#77b0aa] text-xl">Videos</p>
              </div>
              <div className="bg-transparent border-2 border-[#77b0aa] rounded-3xl p-8 w-64 h-48 text-center">
                <p className="text-[#77b0aa] text-lg mb-2">Over</p>
                <div className="text-[#e3fef7] text-5xl font-bold mb-2">
                  {currentSection >= 2 ? <NumberTicker value={400} /> : '0'}
                </div>
                <p className="text-[#77b0aa] text-xl">Channels</p>
              </div>
            </motion.div>

            {/* Auth Buttons */}
            <motion.div 
              className="flex gap-6 mb-8"
              initial={{ opacity: 0, x: 50 }}
              animate={currentSection >= 2 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={handleCreateAccountClick}
                className="px-8 py-4 bg-transparent border-2 border-[#77b0aa] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] hover:text-[#003c43] transition-colors"
              >
                Create account
              </button>
              <button
                onClick={handleLoginClick}
                className="px-8 py-4 bg-transparent border-2 border-[#77b0aa] text-[#e3fef7] rounded-2xl text-lg font-medium hover:bg-[#77b0aa] hover:text-[#003c43] transition-colors"
              >
                Login
              </button>
            </motion.div>

            {/* Feedback Cards Carousel */}
            <motion.div 
              className="w-full max-w-2xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={currentSection >= 2 ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div 
                className="flex gap-6"
                animate={{ x: [0, -400, -800, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                {[...feedbackData, ...feedbackData].map((feedback, index) => (
                  <div
                    key={index}
                    className="bg-transparent border-2 border-[#77b0aa] rounded-2xl p-6 w-80 h-32 flex-shrink-0"
                  >
                    <p className="text-[#e3fef7] text-sm leading-relaxed">{feedback.text}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Dots */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={`w-4 h-4 rounded-full transition-colors ${
              currentSection === index ? 'bg-[#e3fef7]' : 'bg-[#77b0aa]'
            }`}
          />
        ))}
      </div>

      {/* Auth Dialog */}
      <Auth 
        isOpen={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        initialTab={authMode}
      />
    </div>
  );
};

export default HorizontalHomePage;

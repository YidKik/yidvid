
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import { HeroSection } from '@/components/home/horizontal/HeroSection';
import { FeatureCards } from '@/components/home/horizontal/FeatureCards';
import { AboutSection } from '@/components/home/horizontal/AboutSection';
import { ActionButtons } from '@/components/home/horizontal/ActionButtons';
import { StatsCards } from '@/components/home/horizontal/StatsCards';
import { AuthButtons } from '@/components/home/horizontal/AuthButtons';
import { FeedbackCarousel } from '@/components/home/horizontal/FeedbackCarousel';
import { LogoSection } from '@/components/home/horizontal/LogoSection';
import { NavigationDots } from '@/components/home/horizontal/NavigationDots';

const HorizontalHomePage = () => {
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

  return (
    <div className="fixed inset-0 bg-[#003c43] overflow-hidden">
      {/* Horizontal container */}
      <motion.div 
        className="flex h-full"
        animate={{ x: `${-currentSection * 100}vw` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Features & About */}
        <div className="w-screen h-screen flex-shrink-0 bg-[#003c43] relative overflow-y-auto">
          <FeatureCards currentSection={currentSection} />
          <AboutSection currentSection={currentSection} />
        </div>

        {/* Section 3: Stats & Actions */}
        <div className="w-screen h-screen flex-shrink-0 bg-[#003c43] p-8 flex">
          {/* Left Side */}
          <div className="w-1/2 flex flex-col justify-center items-start pl-16">
            <LogoSection currentSection={currentSection} />
            <ActionButtons 
              currentSection={currentSection}
              onRequestChannelClick={handleRequestChannelClick}
            />

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
            <StatsCards currentSection={currentSection} />
            <AuthButtons 
              currentSection={currentSection}
              onCreateAccountClick={handleCreateAccountClick}
              onLoginClick={handleLoginClick}
            />
            <FeedbackCarousel currentSection={currentSection} />
          </div>
        </div>
      </motion.div>

      <NavigationDots 
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

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

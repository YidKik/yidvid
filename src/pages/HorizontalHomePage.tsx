
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
import { useIsMobile } from '@/hooks/use-mobile';

const HorizontalHomePage = () => {
  const { session } = useAuth();
  const { isMobile } = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentSection, setCurrentSection] = useState(0);
  
  const controls = useAnimation();

  // Add horizontal scrolling class to body on mount for desktop only
  useEffect(() => {
    if (!isMobile) {
      document.documentElement.classList.add('home-page');
      document.body.classList.add('home-page');
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.documentElement.classList.remove('home-page');
      document.body.classList.remove('home-page');
      document.body.style.overflow = 'auto';
    };
  }, [isMobile]);

  // Handle scroll events for section detection (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      
      if (Math.abs(delta) > 30) { // Reduced threshold for slower scrolling
        if (delta > 0 && currentSection < 2) {
          setCurrentSection(prev => prev + 1);
        } else if (delta < 0 && currentSection > 0) {
          setCurrentSection(prev => prev - 1);
        }
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, [currentSection, isMobile]);

  // Handle keyboard navigation (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSection < 2) {
        setCurrentSection(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentSection > 0) {
        setCurrentSection(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection, isMobile]);

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

  // Mobile view - render vertical layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#003c43]">
        {/* Mobile sections stacked vertically */}
        <div id="section-0" className="min-h-screen">
          <HeroSection />
        </div>
        <div id="section-1" className="min-h-screen relative">
          <FeatureCards currentSection={1} />
          <AboutSection currentSection={1} />
        </div>
        <div id="section-2" className="min-h-screen relative">
          <div className="p-8 flex flex-col items-center">
            <LogoSection currentSection={2} />
            <ActionButtons 
              currentSection={2}
              onRequestChannelClick={handleRequestChannelClick}
            />
            <StatsCards currentSection={2} />
            <AuthButtons 
              currentSection={2}
              onCreateAccountClick={handleCreateAccountClick}
              onLoginClick={handleLoginClick}
            />
            <p className="text-[#e3fef7] text-sm mt-8">
              All rights reserved @YidVid
            </p>
          </div>
          <FeedbackCarousel currentSection={2} />
        </div>
        
        <Auth 
          isOpen={isAuthOpen} 
          onOpenChange={setIsAuthOpen}
          initialTab={authMode}
        />
      </div>
    );
  }

  // Desktop view - horizontal scrolling
  return (
    <div className="fixed inset-0 bg-[#003c43] overflow-hidden">
      {/* Horizontal container */}
      <motion.div 
        className="flex h-full"
        animate={{ x: `${-currentSection * 100}vw` }}
        transition={{ duration: 1.2, ease: "easeInOut" }} // Slower, smoother transition
      >
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Features & About */}
        <div className="w-screen h-screen flex-shrink-0 bg-[#003c43] relative overflow-hidden">
          <FeatureCards currentSection={currentSection} />
          <AboutSection currentSection={currentSection} />
        </div>

        {/* Section 3: Stats & Actions */}
        <div className="w-screen h-screen flex-shrink-0 bg-[#003c43] p-8 flex relative">
          {/* Left Side */}
          <div className="w-1/2 flex flex-col justify-center items-start pl-16">
            <LogoSection currentSection={currentSection} />
            <ActionButtons 
              currentSection={currentSection}
              onRequestChannelClick={handleRequestChannelClick}
            />

            {/* Copyright at bottom */}
            <motion.p 
              className="text-[#e3fef7] text-sm absolute bottom-8 left-16"
              initial={{ opacity: 0 }}
              animate={currentSection >= 2 ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              All rights reserved @YidVid
            </motion.p>
          </div>

          {/* Right Side */}
          <div className="w-1/2 flex flex-col items-center pt-16 pr-16">
            <StatsCards currentSection={currentSection} />
            <AuthButtons 
              currentSection={currentSection}
              onCreateAccountClick={handleCreateAccountClick}
              onLoginClick={handleLoginClick}
            />
          </div>

          {/* Feedback carousel at bottom */}
          <FeedbackCarousel currentSection={currentSection} />
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

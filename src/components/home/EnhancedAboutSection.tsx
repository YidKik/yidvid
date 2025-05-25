
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Auth from '@/pages/Auth';
import { useAboutSectionScroll } from '@/hooks/useAboutSectionScroll';
import { AboutSectionContent } from './about/AboutSectionContent';
import { StatsCards } from './about/StatsCards';
import { AuthButtons } from './about/AuthButtons';

export const EnhancedAboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  const { scrollProgress } = useAboutSectionScroll(sectionRef);

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <section 
      ref={sectionRef} 
      id="about-section" 
      className="bg-[#003c43] px-6 py-16 relative min-h-screen"
    >
      <div className="container mx-auto relative h-screen flex items-center">
        {/* About Content with smaller blue background - slides out to the left */}
        <motion.div className="w-full">
          <AboutSectionContent scrollProgress={scrollProgress} />
        </motion.div>

        {/* Stats Cards - slide up from bottom in the same blue background area */}
        <motion.div className="absolute inset-0 flex items-center w-full">
          <StatsCards scrollProgress={scrollProgress} />
        </motion.div>

        {/* Auth Buttons - slide up from bottom */}
        <motion.div className="absolute inset-0 flex items-center w-full">
          <AuthButtons scrollProgress={scrollProgress} onAuthClick={handleAuthClick} />
        </motion.div>

        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} initialTab={activeTab} />
      </div>
    </section>
  );
};

export default EnhancedAboutSection;

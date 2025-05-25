
import React, { useState } from 'react';
import Auth from '@/pages/Auth';
import { useAboutSectionScroll } from '@/hooks/useAboutSectionScroll';
import { AboutSectionContent } from './AboutSectionContent';
import { StatsAndAuthCards } from './StatsAndAuthCards';

export const EnhancedAboutSection = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const { sectionRef, scrollProgress } = useAboutSectionScroll();

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <section 
      ref={sectionRef} 
      id="about-section" 
      className="bg-[#003c43] px-6 py-16 relative min-h-screen overflow-hidden"
    >
      <div className="container mx-auto relative h-screen flex items-center">
        <AboutSectionContent scrollProgress={scrollProgress} />
        <StatsAndAuthCards 
          scrollProgress={scrollProgress} 
          onAuthClick={handleAuthClick} 
        />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} initialTab={activeTab} />
      </div>
    </section>
  );
};

export default EnhancedAboutSection;

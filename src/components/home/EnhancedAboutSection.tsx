
import React, { useRef, useState } from 'react';
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
      className="bg-[#003c43] px-6 py-16 relative min-h-screen overflow-hidden"
    >
      <div className="container mx-auto relative h-screen flex items-center">
        {/* About Content slides out to the left */}
        <AboutSectionContent scrollProgress={scrollProgress} />

        {/* Stats Cards - slide up from bottom */}
        <div className="absolute inset-0 flex items-center w-full">
          <StatsCards scrollProgress={scrollProgress} />
        </div>

        {/* Auth Buttons - slide up from bottom */}
        <div className="absolute inset-0 flex items-center w-full">
          <AuthButtons scrollProgress={scrollProgress} onAuthClick={handleAuthClick} />
        </div>

        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} initialTab={activeTab} />
      </div>
    </section>
  );
};

export default EnhancedAboutSection;

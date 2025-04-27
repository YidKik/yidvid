import React, { useState } from 'react';
import { MobileHeroSection } from './mobile/MobileHeroSection';
import { MobileFeaturesSection } from './mobile/MobileFeaturesSection';
import { MobileDescriptionSection } from './mobile/MobileDescriptionSection';
import { MobileStatsSection } from './mobile/MobileStatsSection';
import { MobileFeedbackSection } from './mobile/MobileFeedbackSection';
import { MobileContactSection } from './mobile/MobileContactSection';
import Auth from '@/pages/Auth';

export const MobileHomeSection = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthClick = (type: 'signin' | 'signup') => {
    setActiveTab(type);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#003c43] overflow-y-auto">
      <div className="flex justify-around items-center py-4 px-6">
        {[
          { id: 'home-section', label: 'Home' },
          { id: 'about-section', label: 'About' },
          { id: 'contact-section', label: 'Contact' }
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="text-[#e3fef7] text-sm font-medium bg-transparent border-none p-0 m-0"
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => handleAuthClick('signin')}
          className="text-[#e3fef7] text-sm font-medium bg-transparent border-none p-0 m-0"
        >
          Sign in
        </button>
      </div>
      <div className="px-6">
        <MobileHeroSection />
        <MobileFeaturesSection />
        <MobileDescriptionSection />
        <MobileStatsSection />
        <MobileFeedbackSection />
        <MobileContactSection />
        
        <footer className="text-center text-[#77b0aa] text-xs py-4">
          © {new Date().getFullYear()} YidVid. All Rights Reserved.
        </footer>
      </div>

      <Auth 
        isOpen={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        initialTab={activeTab}
      />
    </div>
  );
};

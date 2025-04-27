
import React from 'react';
import { MobileHeroSection } from './mobile/MobileHeroSection';
import { MobileFeaturesSection } from './mobile/MobileFeaturesSection';
import { MobileDescriptionSection } from './mobile/MobileDescriptionSection';
import { MobileStatsSection } from './mobile/MobileStatsSection';
import { MobileAuthSection } from './mobile/MobileAuthSection';
import { MobileActionsSection } from './mobile/MobileActionsSection';
import { MobileFeedbackSection } from './mobile/MobileFeedbackSection';
import { MobileContactSection } from './mobile/MobileContactSection';

export const MobileHomeSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#003c43] overflow-y-auto">
      <div className="flex justify-around items-center py-4 px-6">
        {[
          { id: 'home-section', label: 'Home' },
          { id: 'about-section', label: 'About' },
          { id: 'contact-section', label: 'Contact' },
          { id: 'sign-in', label: 'Sign in' }
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="text-[#e3fef7] text-sm font-medium"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="px-6">
        <MobileHeroSection />
        <MobileFeaturesSection />
        <MobileDescriptionSection />
        <MobileStatsSection />
        <MobileAuthSection />
        <MobileActionsSection />
        <MobileFeedbackSection />
        <MobileContactSection />
        
        <footer className="text-center text-[#77b0aa] text-xs py-4">
          All rights reserved © YidVid
        </footer>
      </div>
    </div>
  );
};

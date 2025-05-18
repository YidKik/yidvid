
import React, { useState, useEffect } from 'react';
import { MobileHeroSection } from './mobile/MobileHeroSection';
import { MobileFeaturesSection } from './mobile/MobileFeaturesSection';
import { MobileDescriptionSection } from './mobile/MobileDescriptionSection';
import { MobileStatsSection } from './mobile/MobileStatsSection';
import { MobileFeedbackSection } from './mobile/MobileFeedbackSection';
import { MobileContactSection } from './mobile/MobileContactSection';
import { MobileNavHeader } from './mobile/MobileNavHeader';
import Auth from '@/pages/Auth';

export const MobileHomeSection = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Add class to both html and body on mount, remove on unmount
  useEffect(() => {
    document.documentElement.classList.add('home-page');
    document.body.classList.add('home-page');
    
    return () => {
      document.documentElement.classList.remove('home-page');
      document.body.classList.remove('home-page');
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#003c43]">
      <MobileNavHeader />
      <div className="px-6 pt-16">
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

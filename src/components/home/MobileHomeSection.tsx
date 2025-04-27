
import React from 'react';
import { MobileNavHeader } from './mobile/MobileNavHeader';
import { MobileHeroSection } from './mobile/MobileHeroSection';
import { MobileFeaturesSection } from './mobile/MobileFeaturesSection';
import { MobileDescriptionSection } from './mobile/MobileDescriptionSection';
import { MobileStatsSection } from './mobile/MobileStatsSection';
import { MobileAuthSection } from './mobile/MobileAuthSection';
import { MobileActionsSection } from './mobile/MobileActionsSection';
import { MobileFeedbackSection } from './mobile/MobileFeedbackSection';
import { MobileContactSection } from './mobile/MobileContactSection';

export const MobileHomeSection = () => {
  return (
    <div className="min-h-screen w-full bg-[#003c43] overflow-y-auto">
      <MobileNavHeader />
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


import React from 'react';
import { HeroSection } from '@/components/home/horizontal/HeroSection';
import { FeatureCards } from '@/components/home/horizontal/FeatureCards';
import { AboutSection } from '@/components/home/horizontal/AboutSection';
import { ActionButtons } from '@/components/home/horizontal/ActionButtons';
import { StatsCards } from '@/components/home/horizontal/StatsCards';
import { AuthButtons } from '@/components/home/horizontal/AuthButtons';
import { FeedbackCarousel } from '@/components/home/horizontal/FeedbackCarousel';
import { TemporaryDisclaimer } from '@/components/home/TemporaryDisclaimer';

interface MobileHorizontalLayoutProps {
  onRequestChannelClick: () => void;
  onCreateAccountClick: () => void;
  onLoginClick: () => void;
}

export const MobileHorizontalLayout = ({
  onRequestChannelClick,
  onCreateAccountClick,
  onLoginClick
}: MobileHorizontalLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#003c43]">
      {/* Temporary disclaimer overlay */}
      <TemporaryDisclaimer />
      
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
          <ActionButtons 
            currentSection={2}
            onRequestChannelClick={onRequestChannelClick}
          />
          <StatsCards currentSection={2} />
          <AuthButtons 
            currentSection={2}
            onCreateAccountClick={onCreateAccountClick}
            onLoginClick={onLoginClick}
          />
          <p className="text-[#e3fef7] text-sm mt-8">
            All rights reserved @YidVid
          </p>
        </div>
        <FeedbackCarousel currentSection={2} />
      </div>
    </div>
  );
};


import React from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/home/horizontal/HeroSection';
import { FeatureCards } from '@/components/home/horizontal/FeatureCards';
import { AboutSection } from '@/components/home/horizontal/AboutSection';
import { ActionButtons } from '@/components/home/horizontal/ActionButtons';
import { StatsCards } from '@/components/home/horizontal/StatsCards';
import { AuthButtons } from '@/components/home/horizontal/AuthButtons';
import { FeedbackCarousel } from '@/components/home/horizontal/FeedbackCarousel';
import { NavigationDots } from '@/components/home/horizontal/NavigationDots';
import { TemporaryDisclaimer } from '@/components/home/TemporaryDisclaimer';

interface DesktopHorizontalLayoutProps {
  currentSection: number;
  setCurrentSection: (section: number) => void;
  onRequestChannelClick: () => void;
  onCreateAccountClick: () => void;
  onLoginClick: () => void;
}

export const DesktopHorizontalLayout = ({
  currentSection,
  setCurrentSection,
  onRequestChannelClick,
  onCreateAccountClick,
  onLoginClick
}: DesktopHorizontalLayoutProps) => {
  return (
    <div className="fixed inset-0 bg-[#003c43] overflow-hidden">
      {/* Temporary disclaimer overlay */}
      <TemporaryDisclaimer />
      
      {/* Horizontal container */}
      <motion.div 
        className="flex h-full"
        animate={{ x: `${-currentSection * 100}vw` }}
        transition={{ duration: 2.5, ease: "easeInOut" }} // Slower transition
      >
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Features & About */}
        <div className="w-screen h-screen flex-shrink-0 bg-[#003c43] relative overflow-hidden">
          <FeatureCards currentSection={currentSection} />
          <AboutSection currentSection={currentSection} />
        </div>

        {/* Section 3: Stats & Actions */}
        <div className="w-screen h-screen flex-shrink-0 bg-[#003c43] relative overflow-hidden">
          {/* Main content area */}
          <div className="h-screen p-8 flex relative">
            {/* Left Side */}
            <div className="w-1/2 flex flex-col justify-center items-start pl-16">
              <ActionButtons 
                currentSection={currentSection}
                onRequestChannelClick={onRequestChannelClick}
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
            <div className="w-1/2 flex flex-col items-end justify-center pr-16 space-y-12">
              <StatsCards currentSection={currentSection} />
              <AuthButtons 
                currentSection={currentSection}
                onCreateAccountClick={onCreateAccountClick}
                onLoginClick={onLoginClick}
              />
            </div>
          </div>

          {/* Feedback section at bottom - always visible in section 3 */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <FeedbackCarousel currentSection={currentSection} />
          </div>
        </div>
      </motion.div>

      <NavigationDots 
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
    </div>
  );
};

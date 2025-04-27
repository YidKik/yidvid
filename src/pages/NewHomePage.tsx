
import React from 'react';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AboutSection } from '@/components/home/AboutSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeedbackSection } from '@/components/home/FeedbackSection';
import { Footer } from '@/components/home/Footer';

const NewHomePage = () => {
  return (
    <div className="min-h-screen bg-brand-darkest">
      <HomeHeader />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <StatsSection />
      <FeedbackSection />
      <Footer />
    </div>
  );
};

export default NewHomePage;

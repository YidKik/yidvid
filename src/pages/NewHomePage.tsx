
import React from 'react';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AboutSection } from '@/components/home/AboutSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeedbackSection } from '@/components/home/FeedbackSection';
import { Footer } from '@/components/home/Footer';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const NewHomePage = () => {
  return (
    <div className="min-h-screen bg-brand-darkest">
      <HomeHeader />
      <HeroSection />
      
      <ScrollReveal>
        <FeaturesSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <AboutSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <StatsSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <FeedbackSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </div>
  );
};

export default NewHomePage;


import React, { useEffect } from 'react';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AboutSection } from '@/components/home/AboutSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeedbackSection } from '@/components/home/FeedbackSection';
import { Footer } from '@/components/home/Footer';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomeSection } from '@/components/home/MobileHomeSection';

const NewHomePage = () => {
  const { isMobile, isTablet } = useIsMobile();
  
  // Add home-page class to body element when component mounts
  useEffect(() => {
    document.body.classList.add('home-page');
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);
  
  // Return the completely blank mobile section for mobile and tablet views
  if (isMobile || isTablet) {
    return <MobileHomeSection />;
  }

  // Only desktop views will see the full content
  return (
    <div className="min-h-screen">
      <HomeHeader />
      <div className="pt-32"></div>
      <HeroSection />
      
      <ScrollReveal>
        <div className="pt-16"></div>
        <FeaturesSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <div className="pt-12"></div>
        <AboutSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <div className="pt-12"></div>
        <StatsSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <div className="pt-12"></div>
        <FeedbackSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <div className="pt-12"></div>
        <Footer />
      </ScrollReveal>
    </div>
  );
};

export default NewHomePage;

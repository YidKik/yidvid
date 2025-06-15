
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import { ContactDialog } from '@/components/contact/ContactDialog';
import { RequestChannelDialog } from '@/components/youtube/RequestChannelDialog';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AboutSection } from '@/components/home/AboutSection';
import { StatsAndActionsSection } from '@/components/home/StatsAndActionsSection';

const HorizontalHomePage = () => {
  const { session } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('home-page');
    document.body.classList.remove('home-page');
    document.body.style.overflow = 'auto';

    return () => {
      // In case the user navigates away, we don't want these styles to linger.
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleContactClick = () => {
    setIsContactOpen(true);
  };

  const handleRequestChannelClick = () => {
    if (session) {
      setIsRequestChannelOpen(true);
    } else {
      setAuthMode('signin');
      setIsAuthOpen(true);
    }
  };

  const handleCreateAccountClick = () => {
    setAuthMode('signup');
    setIsAuthOpen(true);
  };

  const handleLoginClick = () => {
    setAuthMode('signin');
    setIsAuthOpen(true);
  };

  const handleSendFeedbackClick = () => {
    // For now, this just opens the contact dialog.
    // This could be enhanced later to pre-select a "Feedback" category.
    setIsContactOpen(true);
  };

  return (
    <div className="bg-[#003c43]">
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <StatsAndActionsSection
        onContactClick={handleContactClick}
        onRequestChannelClick={handleRequestChannelClick}
        onSendFeedbackClick={handleSendFeedbackClick}
        onCreateAccountClick={handleCreateAccountClick}
        onLoginClick={handleLoginClick}
      />

      {/* Dialogs */}
      <Auth 
        isOpen={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        initialTab={authMode}
      />
      
      {/* Fix: Changed isOpen to open to fix build error */}
      <ContactDialog 
        open={isContactOpen}
        onOpenChange={setIsContactOpen}
      />
      
      {/* Fix: Changed isOpen to open to fix build error */}
      <RequestChannelDialog
        open={isRequestChannelOpen}
        onOpenChange={setIsRequestChannelOpen}
      />
    </div>
  );
};

export default HorizontalHomePage;

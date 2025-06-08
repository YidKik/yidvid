
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import { useHorizontalHomeScroll } from '@/hooks/useHorizontalHomeScroll';
import { MobileHorizontalLayout } from '@/components/home/horizontal/MobileHorizontalLayout';
import { DesktopHorizontalLayout } from '@/components/home/horizontal/DesktopHorizontalLayout';

const HorizontalHomePage = () => {
  const { session } = useAuth();
  const { currentSection, setCurrentSection, isMobile } = useHorizontalHomeScroll();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleRequestChannelClick = () => {
    if (!session) {
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

  return (
    <>
      {isMobile ? (
        <MobileHorizontalLayout
          onRequestChannelClick={handleRequestChannelClick}
          onCreateAccountClick={handleCreateAccountClick}
          onLoginClick={handleLoginClick}
        />
      ) : (
        <DesktopHorizontalLayout
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          onRequestChannelClick={handleRequestChannelClick}
          onCreateAccountClick={handleCreateAccountClick}
          onLoginClick={handleLoginClick}
        />
      )}

      {/* Auth Dialog */}
      <Auth 
        isOpen={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        initialTab={authMode}
      />
    </>
  );
};

export default HorizontalHomePage;

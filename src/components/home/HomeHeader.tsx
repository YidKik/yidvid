
import React, { useState } from 'react';
import Auth from '@/pages/Auth';
import { useAuth } from '@/hooks/useAuth';

export const HomeHeader = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const { session, handleLogout } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleAuthClick = () => {
    if (session) {
      handleLogout();
    } else {
      setActiveTab('signin');
      setIsAuthOpen(true);
    }
  };

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 bg-[#003c43]">
        <div className="flex items-center space-x-2">
          <span className="text-white font-display text-2xl">YidVid</span>
        </div>
        <nav className="flex items-center space-x-28">
          <button 
            onClick={() => scrollToSection('home-section')} 
            className="text-white bg-transparent border-none p-3 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md"
          >
            <span className="transform-none">Home</span>
          </button>
          <button 
            onClick={() => scrollToSection('about-section')} 
            className="text-white bg-transparent border-none p-3 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md"
          >
            <span className="transform-none">About</span>
          </button>
          <button 
            onClick={() => scrollToSection('contact-section')} 
            className="text-white bg-transparent border-none p-3 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md"
          >
            <span className="transform-none">Contact</span>
          </button>
          <button
            onClick={handleAuthClick}
            className="text-white bg-transparent border-none p-3 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md"
          >
            <span className="transform-none">{session ? 'Sign out' : 'Sign in'}</span>
          </button>
        </nav>
      </header>

      <Auth 
        isOpen={isAuthOpen} 
        onOpenChange={setIsAuthOpen} 
        initialTab={activeTab}
      />
    </>
  );
};

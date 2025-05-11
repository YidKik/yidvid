
import React, { useState } from 'react';
import Auth from '@/pages/Auth';

export const HomeHeader = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 bg-[#003c43]">
        <div className="flex items-center space-x-2">
          <span className="text-white font-display text-2xl">YidVid</span>
        </div>
        <nav className="flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('home-section')} 
            className="text-white transition-colors bg-transparent border-none p-0 m-0 hover:bg-[#135d66] hover:px-3 hover:py-1 hover:rounded-md"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('about-section')} 
            className="text-white transition-colors bg-transparent border-none p-0 m-0 hover:bg-[#135d66] hover:px-3 hover:py-1 hover:rounded-md"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact-section')} 
            className="text-white transition-colors bg-transparent border-none p-0 m-0 hover:bg-[#135d66] hover:px-3 hover:py-1 hover:rounded-md"
          >
            Contact
          </button>
          <button
            onClick={() => {
              setActiveTab('signin');
              setIsAuthOpen(true);
            }}
            className="text-white transition-colors bg-transparent border-none p-0 m-0 hover:bg-[#135d66] hover:px-3 hover:py-1 hover:rounded-md"
          >
            Sign in
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

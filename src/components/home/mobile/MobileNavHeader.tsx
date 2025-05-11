
import React, { useState } from 'react';
import Auth from '@/pages/Auth';

export const MobileNavHeader = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthClick = () => {
    setActiveTab('signin');
    setIsAuthOpen(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#003c43]">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
          <span className="text-white text-lg font-bold">YidVid</span>
        </div>
        
        <nav className="flex items-center justify-end gap-2.5">
          <button
            onClick={() => scrollToSection('home-section')}
            className="text-white text-xs font-medium transition-colors bg-transparent border-none p-0 m-0 hover:bg-[#135d66] hover:text-white hover:px-2 hover:py-1 hover:rounded-md"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('about-section')}
            className="text-white text-xs font-medium transition-colors bg-transparent border-none p-0 m-0 hover:bg-[#135d66] hover:text-white hover:px-2 hover:py-1 hover:rounded-md"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('contact-section')}
            className="text-white text-xs font-medium transition-colors bg-transparent border-none p-0 m-0 hover:bg-[#135d66] hover:text-white hover:px-2 hover:py-1 hover:rounded-md"
          >
            Contact
          </button>
          <button
            onClick={handleAuthClick}
            className="text-white text-xs font-medium transition-colors bg-transparent border-none p-0 m-0 hover:bg-[#135d66] hover:text-white hover:px-2 hover:py-1 hover:rounded-md"
          >
            Sign in
          </button>
        </nav>
      </div>
      
      <Auth 
        isOpen={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        initialTab={activeTab}
      />
    </header>
  );
}

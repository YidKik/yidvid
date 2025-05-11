
import React, { useState } from 'react';
import Auth from '@/pages/Auth';
import { useAuth } from '@/hooks/useAuth';

export const MobileNavHeader = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const { session, handleLogout } = useAuth();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#003c43]">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
          <span className="text-white text-lg font-bold">YidVid</span>
        </div>
        
        <nav className="flex items-center justify-end gap-2.5">
          <button
            onClick={() => scrollToSection('home-section')}
            className="text-white text-xs font-medium bg-transparent border-none p-2 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md"
          >
            <span className="transform-none">Home</span>
          </button>
          <button
            onClick={() => scrollToSection('about-section')}
            className="text-white text-xs font-medium bg-transparent border-none p-2 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md"
          >
            <span className="transform-none">About</span>
          </button>
          <button
            onClick={() => scrollToSection('contact-section')}
            className="text-white text-xs font-medium bg-transparent border-none p-2 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md"
          >
            <span className="transform-none">Contact</span>
          </button>
          <button
            onClick={handleAuthClick}
            className="text-white text-xs font-medium bg-transparent border-none p-2 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md"
          >
            <span className="transform-none">{session ? 'Sign out' : 'Sign in'}</span>
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

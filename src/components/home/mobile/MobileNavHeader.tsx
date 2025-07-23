
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
            className="text-white transition-colors bg-transparent border-none p-1 m-0 hover:bg-[#135d66] hover:text-white hover:rounded-md flex items-center justify-center"
            title={session ? 'Sign out' : 'Sign in'}
          >
            {session ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10,17 15,12 10,7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            )}
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

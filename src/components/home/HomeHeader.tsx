
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from '@/pages/Auth';

export const HomeHeader = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" alt="YidVid Logo" className="h-12" />
          <span className="text-white font-display text-2xl">YidVid</span>
        </div>
        <nav className="flex items-center space-x-8">
          <Link to="/" className="text-white hover:text-brand-lightest transition-colors">Home</Link>
          <button 
            onClick={() => scrollToSection('about-section')} 
            className="text-white hover:text-brand-lightest transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact-section')} 
            className="text-white hover:text-brand-lightest transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="text-white hover:text-brand-lightest transition-colors"
          >
            Sign in
          </button>
        </nav>
      </header>

      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};

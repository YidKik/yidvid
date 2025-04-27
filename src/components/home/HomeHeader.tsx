import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from '@/pages/Auth';

export const HomeHeader = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId.split('-')[0]);
    }
  };

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 bg-[#003c43]">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
            alt="YidVid Logo" 
            className="h-12 w-auto object-contain" 
          />
          <span className="text-white font-display text-2xl">YidVid</span>
        </div>
        <nav className="flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-white transition-colors ${
              activeSection === 'home' 
                ? 'text-[#77b0aa]' 
                : 'hover:text-[#77b0aa]'
            }`}
          >
            Home
          </Link>
          <button 
            onClick={() => scrollToSection('about-section')} 
            className={`text-white transition-colors bg-transparent border-none p-0 m-0 ${
              activeSection === 'about' 
                ? 'text-[#77b0aa]' 
                : 'hover:text-[#77b0aa]'
            }`}
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact-section')} 
            className={`text-white transition-colors bg-transparent border-none p-0 m-0 ${
              activeSection === 'contact' 
                ? 'text-[#77b0aa]' 
                : 'hover:text-[#77b0aa]'
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => {
              setActiveTab('signin');
              setIsAuthOpen(true);
            }}
            className="text-white hover:text-[#77b0aa] transition-colors bg-transparent border-none p-0 m-0"
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

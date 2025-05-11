
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Auth from '@/pages/Auth';

export const HomeHeader = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [activeSection, setActiveSection] = useState('home');

  // Enhanced scroll detection to determine active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Add offset to make detection smoother
      
      // Get section positions
      const homeSection = 0;
      const aboutSection = document.getElementById('about-section')?.offsetTop || 0;
      const contactSection = document.getElementById('contact-section')?.offsetTop || 0;
      
      // Determine active section based on scroll position
      if (scrollPosition < aboutSection) {
        setActiveSection('home');
      } else if (scrollPosition < contactSection) {
        setActiveSection('about');
      } else {
        setActiveSection('contact');
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check for active section
    handleScroll();
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <span className="text-white font-display text-2xl">YidVid</span>
        </div>
        <nav className="flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('home-section')} 
            className={`text-white transition-colors bg-transparent border-none p-0 m-0 hover:bg-transparent ${
              activeSection === 'home' 
                ? 'bg-[#135d66] px-3 py-1 rounded-md' 
                : ''
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('about-section')} 
            className={`text-white transition-colors bg-transparent border-none p-0 m-0 hover:bg-transparent ${
              activeSection === 'about' 
                ? 'bg-[#135d66] px-3 py-1 rounded-md' 
                : ''
            }`}
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact-section')} 
            className={`text-white transition-colors bg-transparent border-none p-0 m-0 hover:bg-transparent ${
              activeSection === 'contact' 
                ? 'bg-[#135d66] px-3 py-1 rounded-md' 
                : ''
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => {
              setActiveTab('signin');
              setIsAuthOpen(true);
            }}
            className="text-white transition-colors bg-transparent border-none p-0 m-0 hover:bg-transparent"
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

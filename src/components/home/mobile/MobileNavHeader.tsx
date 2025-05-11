
import React, { useState, useEffect } from 'react';

export const MobileNavHeader = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Add offset for better detection
      const sections = {
        home: 0,
        about: document.getElementById('about-section')?.offsetTop || 0,
        contact: document.getElementById('contact-section')?.offsetTop || 0
      };
      
      // Determine active section based on scroll position
      if (scrollPosition < sections.about) {
        setActiveSection('home');
      } else if (scrollPosition < sections.contact) {
        setActiveSection('about');
      } else {
        setActiveSection('contact');
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check for active section
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-4 h-16 bg-transparent">
        <div className="flex items-center text-lg font-bold">
          YidVid
        </div>
        
        <nav className="flex items-center gap-6">
          {[
            { id: 'home-section', label: 'Home' },
            { id: 'about-section', label: 'About' },
            { id: 'contact-section', label: 'Contact' },
            { id: 'sign-in', label: 'Sign in' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={`text-sm font-medium transition-colors border-none p-0 m-0 bg-transparent hover:bg-transparent ${
                activeSection === id.split('-')[0] && id !== 'sign-in'
                  ? 'text-black font-medium bg-[#135d66]/20 px-3 py-1 rounded-md'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

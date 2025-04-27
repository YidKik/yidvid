
import React, { useState, useEffect } from 'react';

export const MobileNavHeader = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sections = {
        home: 0,
        about: document.getElementById('about-section')?.offsetTop || 0,
        contact: document.getElementById('contact-section')?.offsetTop || 0
      };
      
      // Add some offset to make the highlighting feel more natural
      const offset = 100;
      
      if (scrollPosition < sections.about - offset) {
        setActiveSection('home');
      } else if (scrollPosition < sections.contact - offset) {
        setActiveSection('about');
      } else {
        setActiveSection('contact');
      }
    };

    window.addEventListener('scroll', handleScroll);
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
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
            alt="YidVid Logo" 
            className="h-12 w-auto"
          />
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
              className={`text-sm font-medium transition-colors bg-transparent border-none p-0 m-0 ${
                activeSection === id.split('-')[0]
                  ? 'text-black'
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

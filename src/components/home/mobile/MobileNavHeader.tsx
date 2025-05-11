
import React from 'react';

export const MobileNavHeader = () => {
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
        
        <nav className="flex items-center gap-16">
          <button
            onClick={() => scrollToSection('home-section')}
            className="text-sm font-medium transition-colors border-none p-0 m-0 bg-transparent hover:bg-[#135d66] hover:px-2 hover:py-1 hover:rounded-md"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('about-section')}
            className="text-sm font-medium transition-colors border-none p-0 m-0 bg-transparent hover:bg-[#135d66] hover:px-2 hover:py-1 hover:rounded-md"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('contact-section')}
            className="text-sm font-medium transition-colors border-none p-0 m-0 bg-transparent hover:bg-[#135d66] hover:px-2 hover:py-1 hover:rounded-md"
          >
            Contact
          </button>
          <button
            onClick={() => {}}
            className="text-sm font-medium transition-colors border-none p-0 m-0 bg-transparent hover:bg-[#135d66] hover:px-2 hover:py-1 hover:rounded-md"
          >
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}

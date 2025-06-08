
import React from 'react';
import { Video, Info, LogIn } from 'lucide-react';

interface NavigationDotsWithIconsProps {
  currentSection: number;
  onSectionChange: (section: number) => void;
  onLoginClick: () => void;
}

export const NavigationDotsWithIcons = ({ 
  currentSection, 
  onSectionChange, 
  onLoginClick 
}: NavigationDotsWithIconsProps) => {
  const handleDotClick = (index: number) => {
    if (index === 0) {
      // Videos page - use window.location instead of useNavigate to avoid context issues
      window.location.href = '/videos';
    } else if (index === 1) {
      // About section - navigate to section 1 (the features/about section)
      onSectionChange(1);
    } else if (index === 2) {
      // Sign in popup
      onLoginClick();
    }
  };

  const dots = [
    { icon: Video, label: 'Videos', index: 0 },
    { icon: Info, label: 'About', index: 1 },
    { icon: LogIn, label: 'Sign In', index: 2 }
  ];

  return (
    <div className="fixed left-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-6 z-50">
      {dots.map(({ icon: Icon, label, index }) => (
        <div key={index} className="relative group">
          <button
            onClick={() => handleDotClick(index)}
            className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center hover:scale-110 relative ${
              currentSection === index 
                ? 'bg-[#e3fef7] border-[#e3fef7] text-[#003c43]' 
                : 'bg-transparent border-[#77b0aa] text-[#77b0aa] hover:border-[#e3fef7] hover:text-[#e3fef7]'
            }`}
          >
            <Icon className="w-6 h-6" />
          </button>
          
          {/* Sliding tooltip */}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none">
            <div className="bg-[#77b0aa] text-[#e3fef7] px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


import React from 'react';
import { Video, Info, LogIn } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleDotClick = (index: number) => {
    if (index === 0) {
      // Videos page
      navigate('/videos');
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
    <TooltipProvider>
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-6 z-50">
        {dots.map(({ icon: Icon, label, index }) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleDotClick(index)}
                className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center hover:scale-110 ${
                  currentSection === index 
                    ? 'bg-[#e3fef7] border-[#e3fef7] text-[#003c43]' 
                    : 'bg-transparent border-[#77b0aa] text-[#77b0aa] hover:border-[#e3fef7] hover:text-[#e3fef7]'
                }`}
              >
                <Icon className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#135d66] text-[#e3fef7] border-[#77b0aa]">
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

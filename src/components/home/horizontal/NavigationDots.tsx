
import React from 'react';

interface NavigationDotsProps {
  currentSection: number;
  onSectionChange: (section: number) => void;
}

export const NavigationDots = ({ currentSection, onSectionChange }: NavigationDotsProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
      {[0, 1, 2].map((index) => (
        <button
          key={index}
          onClick={() => onSectionChange(index)}
          className={`w-4 h-4 rounded-full transition-colors ${
            currentSection === index ? 'bg-[#e3fef7]' : 'bg-[#77b0aa]'
          }`}
        />
      ))}
    </div>
  );
};

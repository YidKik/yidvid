
import React from 'react';

interface AuthButtonsProps {
  scrollProgress: number;
  onAuthClick: (tab: 'signin' | 'signup') => void;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ scrollProgress, onAuthClick }) => {
  // Cards slide up from bottom based on scroll progress
  const cardsTransform = `translateY(${100 - (scrollProgress * 100)}%)`;
  const cardsOpacity = scrollProgress;

  return (
    <div 
      style={{ 
        transform: cardsTransform, 
        opacity: cardsOpacity,
        transition: 'none' // Disable default transitions for smooth scroll control
      }}
      className="absolute inset-0 flex items-center w-full"
    >
      <div className="container mx-auto">
        <div className="mt-8 mb-6 bg-[#135d66] rounded-3xl p-12 mx-auto max-w-6xl">
          <div className="flex justify-between space-x-8 mt-12">
            <button 
              onClick={() => onAuthClick('signup')}
              className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-colors duration-300"
            >
              Create account
            </button>

            <button 
              onClick={() => onAuthClick('signin')}
              className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-colors duration-300"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

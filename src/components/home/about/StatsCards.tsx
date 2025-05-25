
import React from 'react';
import { NumberTicker } from '@/components/ui/number-ticker';

interface StatsCardsProps {
  scrollProgress: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ scrollProgress }) => {
  // Cards slide up from bottom based on scroll progress
  // Only start sliding up when the about content is halfway out
  const slideThreshold = 0.3; // Start sliding stats at 30% of about section slide
  const adjustedProgress = Math.max(0, (scrollProgress - slideThreshold) / (1 - slideThreshold));
  const cardsTransform = `translateY(${100 - (adjustedProgress * 100)}%)`;
  const cardsOpacity = adjustedProgress;

  return (
    <div 
      style={{ 
        transform: cardsTransform, 
        opacity: cardsOpacity,
        transition: 'none', // Disable default transitions for smooth scroll control
        pointerEvents: scrollProgress < slideThreshold ? 'none' : 'auto' // Prevent interaction when hidden
      }}
      className="absolute inset-0 flex items-center w-full"
    >
      <div className="container mx-auto">
        <div className="mt-8 mb-6 bg-[#135d66] rounded-3xl p-12 mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8">
            <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8">
              <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
              <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                <NumberTicker value={400} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
              </h3>
              <p className="text-[#77b0aa] text-4xl">Channels</p>
            </div>
            
            <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8">
              <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
              <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                <NumberTicker value={10000} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
              </h3>
              <p className="text-[#77b0aa] text-4xl">Videos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

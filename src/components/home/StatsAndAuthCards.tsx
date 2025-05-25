
import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { NumberTicker } from '@/components/ui/number-ticker';

interface StatsAndAuthCardsProps {
  scrollProgress: number;
  onAuthClick: (tab: 'signin' | 'signup') => void;
}

export const StatsAndAuthCards: React.FC<StatsAndAuthCardsProps> = ({ 
  scrollProgress, 
  onAuthClick 
}) => {
  // Cards slide in from the right
  const cardsTransformX = useTransform(() => 120 - (scrollProgress * 150)); // Adjusted for better timing
  const cardsOpacity = useTransform(() => Math.min(1, scrollProgress * 1.8)); // Faster fade-in

  return (
    <motion.div 
      style={{ 
        x: cardsTransformX, 
        opacity: cardsOpacity 
      }}
      className="absolute inset-0 flex items-center w-full"
    >
      <div className="container mx-auto">
        <motion.div 
          style={{ 
            x: cardsTransformX, 
            opacity: cardsOpacity 
          }}
          className="mt-8 mb-6 bg-[#135d66] rounded-3xl p-12 mx-auto max-w-6xl"
        >
          <div className="space-y-12">
            <div className="grid grid-cols-2 gap-8">
              <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8 transform transition-all duration-500 hover:scale-105">
                <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
                <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                  <NumberTicker value={400} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
                </h3>
                <p className="text-[#77b0aa] text-4xl">Channels</p>
              </div>
              
              <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8 transform transition-all duration-500 hover:scale-105">
                <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
                <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                  <NumberTicker value={10000} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
                </h3>
                <p className="text-[#77b0aa] text-4xl">Videos</p>
              </div>
            </div>

            <div className="flex justify-between space-x-8">
              <button 
                onClick={() => onAuthClick('signup')}
                className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-all duration-300 hover:scale-105"
              >
                Create account
              </button>

              <button 
                onClick={() => onAuthClick('signin')}
                className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-all duration-300 hover:scale-105"
              >
                Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

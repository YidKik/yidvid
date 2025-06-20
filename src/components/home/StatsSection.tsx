
import React, { useState } from 'react';
import { NumberTicker } from '@/components/ui/number-ticker';
import Auth from '@/pages/Auth';

export const StatsSection = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <section className="container mx-auto px-6 py-24 space-y-12">
      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
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

      <div className="flex justify-between space-x-8 max-w-4xl mx-auto">
        <button 
          onClick={() => handleAuthClick('signup')}
          className="w-[calc(50%-1rem)] h-80 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl font-medium hover:bg-[#135d66] transition-colors duration-300"
        >
          Create account
        </button>

        <button 
          onClick={() => handleAuthClick('signin')}
          className="w-[calc(50%-1rem)] h-80 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl font-medium hover:bg-[#135d66] transition-colors duration-300"
        >
          Login
        </button>
      </div>

      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} initialTab={activeTab} />
    </section>
  );
};

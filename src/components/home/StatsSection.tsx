
import React from 'react';
import { Link } from 'react-router-dom';
import { NumberTicker } from '@/components/ui/number-ticker';

export const StatsSection = () => {
  return (
    <section className="container mx-auto px-6 py-16 space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-brand-darkest flex flex-col items-center justify-center p-8">
          <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
          <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
            <NumberTicker value={400} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
          </h3>
          <p className="text-[#77b0aa] text-4xl">Channels</p>
        </div>
        
        <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-brand-darkest flex flex-col items-center justify-center p-8">
          <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
          <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
            <NumberTicker value={10000} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
          </h3>
          <p className="text-[#77b0aa] text-4xl">Videos</p>
        </div>
      </div>

      <div className="flex justify-between space-x-8">
        <Link 
          to="/signup"
          className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] text-[#ddf9f2] text-2xl hover:bg-brand-dark transition-colors duration-300"
        >
          Create account
        </Link>

        <Link 
          to="/signin"
          className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] text-[#ddf9f2] text-2xl hover:bg-brand-dark transition-colors duration-300"
        >
          Login
        </Link>
      </div>
    </section>
  );
};

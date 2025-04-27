
import React from 'react';
import { Link } from 'react-router-dom';

export const StatsSection = () => {
  return (
    <section className="container mx-auto px-6 py-16 space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="relative group h-96">
          <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-[#135d66] to-[#ddf9f2] animate-border-flow">
            <div className="absolute inset-0 rounded-3xl bg-brand-darkest"></div>
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
            <p className="text-[#77b0aa] text-2xl mb-4">Over</p>
            <h3 className="text-[#ddf9f2] text-7xl font-display mb-4">400</h3>
            <p className="text-[#77b0aa] text-2xl">Channels</p>
          </div>
        </div>
        
        <div className="relative group h-96">
          <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-[#135d66] to-[#ddf9f2] animate-border-flow">
            <div className="absolute inset-0 rounded-3xl bg-brand-darkest"></div>
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
            <p className="text-[#77b0aa] text-2xl mb-4">Over</p>
            <h3 className="text-[#ddf9f2] text-7xl font-display mb-4">10,000</h3>
            <p className="text-[#77b0aa] text-2xl">Videos</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-8">
        <Link 
          to="/signup"
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-[#135d66] to-[#ddf9f2] animate-border-flow">
            <div className="absolute inset-0 rounded-3xl bg-brand-darkest"></div>
          </div>
          <div className="relative z-10 rounded-3xl px-16 py-4">
            <span className="text-[#ddf9f2] text-xl">Create account</span>
          </div>
        </Link>

        <Link 
          to="/signin"
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-[#135d66] to-[#ddf9f2] animate-border-flow">
            <div className="absolute inset-0 rounded-3xl bg-brand-darkest"></div>
          </div>
          <div className="relative z-10 rounded-3xl px-16 py-4">
            <span className="text-[#ddf9f2] text-xl">Login</span>
          </div>
        </Link>
      </div>
    </section>
  );
};


import React from 'react';
import { Link } from 'react-router-dom';

export const MobileHomeSection = () => {
  return (
    <div className="min-h-screen w-full bg-[#003c43] px-6 py-12 overflow-y-auto flex items-center justify-center">
      <div className="flex flex-col items-center text-center space-y-6 mt-24">
        <h1 className="text-5xl font-bold text-[#e3fef7] leading-tight tracking-tight">
          Your Gateway to Jewish Content
        </h1>
        <p className="text-xl text-[#77b0aa] max-w-md mx-auto">
          Watch, share, and connect with the finest Jewish content from around the world.
        </p>
        <Link 
          to="/explore"
          className="px-8 py-3 border-2 border-[#77b0aa] text-[#e3fef7] rounded-full text-xl hover:bg-[#135d66] transition-colors duration-300 mt-4"
        >
          Explore
        </Link>
      </div>
    </div>
  );
};


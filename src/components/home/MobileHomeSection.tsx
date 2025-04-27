
import React from 'react';
import { Link } from 'react-router-dom';

export const MobileHomeSection = () => {
  return (
    <div className="min-h-screen w-full bg-[#003c43]">
      {/* Header */}
      <header className="w-full px-4 py-3 flex items-center justify-between">
        <img 
          src="/lovable-uploads/dd4fbfcb-aeb9-4cd3-a7b1-9dbf07b81a43.png" 
          alt="YidVid Logo" 
          className="w-24 h-24 object-contain"
        />
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-[#e3fef7] text-sm">Home</Link>
          <Link to="/about" className="text-[#e3fef7] text-sm">About</Link>
          <Link to="/contact" className="text-[#e3fef7] text-sm">Contact</Link>
          <Link to="/signin" className="text-[#e3fef7] text-sm">
            Sign in
          </Link>
        </nav>
      </header>

      <div className="px-4 pt-8">
        <div className="flex justify-center">
          <Link to="/videos">
            <button className="px-8 py-3 bg-[#135d66] text-[#e3fef7] text-lg font-medium rounded-full border-2 border-[#77b0aa]">
              Explorer
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};


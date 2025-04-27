
import React from 'react';
import { Link } from 'react-router-dom';

export const HomeHeader = () => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <img src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" alt="YidVid Logo" className="h-12" />
        <span className="text-white font-display text-2xl">YidVid</span>
      </div>
      <nav className="flex items-center space-x-8">
        <Link to="/" className="text-white hover:text-brand-lightest transition-colors">Home</Link>
        <Link to="/about" className="text-white hover:text-brand-lightest transition-colors">About</Link>
        <Link to="/contact" className="text-white hover:text-brand-lightest transition-colors">Contact</Link>
        <Link to="/signin" className="text-white hover:text-brand-lightest transition-colors">Sign in</Link>
      </nav>
    </header>
  );
};

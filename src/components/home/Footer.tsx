
import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-brand-darkest py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-center space-x-10 mb-12">
          {['Contact', 'Send feedback', 'Request channel'].map((text) => (
            <button
              key={text}
              className="px-14 py-5 rounded-3xl border-2 border-brand-lightest text-white text-xl hover:bg-brand-dark transition-all duration-300"
            >
              {text}
            </button>
          ))}
        </div>
        <p className="text-center text-brand-light text-lg mt-8">All rights reserved @YidVid</p>
      </div>
    </footer>
  );
};

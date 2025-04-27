
import React from 'react';

export const FeedbackSection = () => {
  return (
    <section className="bg-brand-dark py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-display text-white text-center mb-12">Feedback</h2>
        <div className="grid grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <div 
              key={item} 
              className="p-6 rounded-3xl border-2 border-brand-lightest bg-brand-darkest h-80 flex items-center justify-center"
              style={{ minHeight: '320px' }}
            >
              <p className="text-brand-light">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

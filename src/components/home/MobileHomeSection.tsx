
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export const MobileHomeSection = () => {
  const feedbackItems = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  ];

  return (
    <div className="min-h-screen w-full bg-[#003c43] px-6 py-12 overflow-y-auto">
      <div className="flex flex-col items-center text-center space-y-6 mt-16">
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

      {/* Stats Boxes */}
      <div className="mt-24 space-y-6">
        <div className="border-2 border-[#77b0aa] rounded-2xl p-8 text-center bg-[#135d66]/20">
          <p className="text-[#e3fef7] text-6xl font-mono font-bold mb-2">10,000</p>
          <p className="text-[#77b0aa] text-2xl">Videos</p>
        </div>
        
        <div className="border-2 border-[#77b0aa] rounded-2xl p-8 text-center bg-[#135d66]/20">
          <p className="text-[#77b0aa] text-2xl mb-2">Over</p>
          <p className="text-[#e3fef7] text-6xl font-mono font-bold">400</p>
          <p className="text-[#77b0aa] text-2xl">Channels</p>
        </div>
      </div>

      {/* Auth Buttons */}
      <div className="mt-12 space-y-4">
        <Link to="/signup" className="block">
          <Button variant="outline" className="w-full py-6 text-lg border-2 border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
            Create account
          </Button>
        </Link>
        <Link to="/signin" className="block">
          <Button variant="outline" className="w-full py-6 text-lg border-2 border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
            Login
          </Button>
        </Link>
      </div>

      {/* Feedback Section */}
      <div className="mt-16">
        <h2 className="text-[#e3fef7] text-3xl font-bold text-center mb-8">Feedback</h2>
        <div className="relative overflow-hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {feedbackItems.map((feedback, index) => (
              <div 
                key={index}
                className="min-w-full flex-shrink-0 snap-center px-4"
              >
                <div className="border-2 border-[#77b0aa] rounded-3xl p-6 bg-[#135d66]/20">
                  <p className="text-[#e3fef7] text-center leading-relaxed">
                    {feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {feedbackItems.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#e3fef7]' : 'bg-[#77b0aa]'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 space-y-4 mb-8">
        <Button variant="outline" className="w-full py-6 text-lg border-2 border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
          Send feedback
        </Button>
        <Button variant="outline" className="w-full py-6 text-lg border-2 border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
          Contact
        </Button>
        <Button variant="outline" className="w-full py-6 text-lg border-2 border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
          Request channel
        </Button>
      </div>

      {/* Footer */}
      <footer className="text-center text-[#77b0aa] text-sm mt-8">
        All rights reserved © YidVid
      </footer>
    </div>
  );
};

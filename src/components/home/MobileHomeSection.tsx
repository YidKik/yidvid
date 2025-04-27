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
    <div className="min-h-screen w-full bg-[#003c43] px-6 overflow-y-auto">
      {/* Hero Section with multi-line text and increased spacing */}
      <div className="flex flex-col items-center text-center space-y-6 pt-24">
        <h1 className="text-5xl font-bold text-[#e3fef7] leading-tight space-y-2">
          <div>Your</div>
          <div>Getaway to Jewish Content</div>
        </h1>
        <p className="text-lg text-[#77b0aa] px-4">
          Watch, share, and connect with the finest Jewish content from around the world.
        </p>
        <Link 
          to="/explore"
          className="px-8 py-3 border border-[#77b0aa] text-[#e3fef7] rounded-full text-base hover:bg-[#135d66] transition-colors duration-300"
        >
          Explore
        </Link>
      </div>

      {/* Feature Boxes with increased top margin */}
      <div className="mt-24 flex justify-center gap-4">
        {['Free', 'Kosher', 'Up to date'].map((text) => (
          <div 
            key={text}
            className="px-4 py-2 border border-[#77b0aa] rounded-full text-[#e3fef7] text-sm bg-[#135d66]/20"
          >
            {text}
          </div>
        ))}
      </div>

      {/* Description Text */}
      <div className="mt-8 text-sm text-[#e3fef7] leading-relaxed space-y-4">
        <p>
          We understand the importance of providing a safe and enjoyable platform for individuals and families to access entertainment content that aligns with their values. Our team is dedicated to creating a diverse range of videos that cater to a wide audience, while ensuring that all content meets our strict guidelines for kosher entertainment.
        </p>
        <p>
          By offering a free platform for users to create an account and access our content, we aim to make it easy for everyone to enjoy the latest videos in a secure environment. Our commitment to staying up-to-date with the latest trends and updates in the entertainment industry ensures that we are always bringing you the best content available.
        </p>
        <p>
          At YidVid, we take pride in our attention to detail and commitment to providing top-quality entertainment options for our users. We strive to maintain the highest level of standards in everything we do, so you can trust that you are getting nothing but the best when you visit our site. Thank you for choosing
        </p>
      </div>

      {/* Stats Boxes */}
      <div className="mt-12 space-y-4">
        <div className="border-2 border-[#77b0aa] rounded-3xl p-6 text-center bg-[#135d66]/20">
          <p className="text-[#e3fef7] text-5xl font-bold mb-1">10,000</p>
          <p className="text-[#77b0aa] text-xl">Videos</p>
        </div>
        
        <div className="border-2 border-[#77b0aa] rounded-3xl p-6 text-center bg-[#135d66]/20">
          <p className="text-[#77b0aa] text-lg mb-1">Over</p>
          <p className="text-[#e3fef7] text-5xl font-bold mb-1">400</p>
          <p className="text-[#77b0aa] text-xl">Channels</p>
        </div>
      </div>

      {/* Auth Buttons */}
      <div className="mt-8 space-y-3">
        <Link to="/signup" className="block">
          <Button variant="outline" className="w-full py-4 text-base border border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
            Create account
          </Button>
        </Link>
        <Link to="/signin" className="block">
          <Button variant="outline" className="w-full py-4 text-base border border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
            Login
          </Button>
        </Link>
      </div>

      {/* Feedback Section */}
      <div className="mt-12">
        <h2 className="text-[#e3fef7] text-2xl font-bold text-center mb-6">Feedback</h2>
        <div className="relative overflow-hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {feedbackItems.map((feedback, index) => (
              <div 
                key={index}
                className="min-w-full flex-shrink-0 snap-center px-4"
              >
                <div className="border border-[#77b0aa] rounded-3xl p-4 bg-[#135d66]/20">
                  <p className="text-[#e3fef7] text-sm text-center leading-relaxed">
                    {feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
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
      <div className="mt-8 space-y-3 mb-8">
        <Button variant="outline" className="w-full py-4 text-base border border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
          Send feedback
        </Button>
        <Button variant="outline" className="w-full py-4 text-base border border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
          Contact
        </Button>
        <Button variant="outline" className="w-full py-4 text-base border border-[#77b0aa] text-[#e3fef7] bg-transparent hover:bg-[#135d66] rounded-full">
          Request channel
        </Button>
      </div>

      {/* Footer */}
      <footer className="text-center text-[#77b0aa] text-xs py-4">
        All rights reserved © YidVid
      </footer>
    </div>
  );
};

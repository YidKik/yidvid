
import React from 'react';
import { Link } from 'react-router-dom';

export const MobileHomeSection = () => {
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

      <div className="mt-24 flex flex-col space-y-4 mb-12">
        {['Free', 'Kosher', 'Up to date'].map((text) => (
          <div 
            key={text}
            className="w-full py-4 bg-[#135d66] rounded-xl text-center text-[#e3fef7] text-xl border border-[#77b0aa]"
          >
            {text}
          </div>
        ))}
      </div>

      <div className="space-y-6 text-[#e3fef7] mb-12">
        <p className="leading-relaxed">
          We understand the importance of providing a safe and enjoyable platform for individuals and families to access entertainment content that aligns with their values. Our team is dedicated to curating a diverse range of videos that cater to a wide audience while ensuring that all content meets strict guidelines for kosher entertainment.
        </p>
        
        <p className="leading-relaxed">
          By offering a free platform for users to create an account and access our content, we aim to make it easy for everyone to enjoy the latest videos in a secure environment. Our commitment to staying up-to-date with the latest trends and updates in the entertainment industry ensures that we are always bringing you the best content available.
        </p>
        
        <p className="leading-relaxed">
          At YidVid, we take pride in our attention to detail and commitment to providing top-quality entertainment options for our users. We strive to maintain the highest level of standards in everything we do, so you can trust that you are getting nothing but the best when you visit our site. Thank you for choosing us.
        </p>
      </div>

      <div className="border-2 border-[#77b0aa] rounded-2xl p-6 text-center">
        <p className="text-[#77b0aa] text-2xl mb-2">Over</p>
        <p className="text-[#e3fef7] text-5xl font-bold mb-2">10,000</p>
        <p className="text-[#77b0aa] text-2xl">Videos</p>
      </div>
    </div>
  );
};


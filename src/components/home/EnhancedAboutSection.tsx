
import React, { useState } from 'react';
import Auth from '@/pages/Auth';

export const EnhancedAboutSection = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <section 
      id="about-section" 
      className="bg-[#003c43] px-6 py-16"
    >
      <div className="container mx-auto">
        <div className="mt-8 mb-6 bg-[#135d66] rounded-3xl p-12 mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-6xl font-display text-white">About</h2>
              <div className="space-y-6 text-lg text-white/90">
                <p>
                  We understand the importance of providing a safe and enjoyable platform
                  for individuals and families to access content that aligns with
                  their values. Our team is dedicated to curating a diverse range of videos that
                  cater to a wide audience, while ensuring that all content meets our strict
                  guidelines.
                </p>
                <p>
                  By offering a free platform for users to create an account and access our content,
                  we aim to make it easy for everyone to enjoy the latest videos in a
                  secure environment. Our commitment to staying up-to-date with the latest
                  trends and updates ensures that we are always
                  bringing you the best content available.
                </p>
                <p>
                  At YidVid, we take pride in our attention to detail and commitment to providing
                  top-quality video options for our users. We strive to maintain
                  the highest level of standards in everything we do, so you can trust that you
                  are getting nothing but the best when you visit our site. Thank you for
                  choosing YidVid as your go-to source for kosher Jewish content.
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <img
                src="/public/yidvid-logo.png"
                alt="YidVid Logo"
                className="w-[600px] h-[600px] object-contain"
              />
            </div>
          </div>
          
          <div className="mt-12 space-y-12">
            <div className="grid grid-cols-2 gap-8">
              <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8 transform transition-all duration-500 hover:scale-105">
                <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
                <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">400</h3>
                <p className="text-[#77b0aa] text-4xl">Channels</p>
              </div>
              
              <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8 transform transition-all duration-500 hover:scale-105">
                <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
                <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">10000</h3>
                <p className="text-[#77b0aa] text-4xl">Videos</p>
              </div>
            </div>

            <div className="flex justify-between space-x-8">
              <button 
                onClick={() => handleAuthClick('signup')}
                className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-all duration-300 hover:scale-105"
              >
                Create account
              </button>

              <button 
                onClick={() => handleAuthClick('signin')}
                className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-all duration-300 hover:scale-105"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} initialTab={activeTab} />
    </section>
  );
};

export default EnhancedAboutSection;

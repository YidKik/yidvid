
import React from 'react';

interface AboutSectionContentProps {
  scrollProgress: number;
}

export const AboutSectionContent: React.FC<AboutSectionContentProps> = ({ scrollProgress }) => {
  // Calculate transforms based on scroll progress - slide much further left to completely disappear
  const aboutTextTransform = `translateX(${scrollProgress * -200}%)`;
  const aboutTextOpacity = Math.max(0, 1 - (scrollProgress * 2));

  return (
    <div 
      style={{ 
        transform: aboutTextTransform, 
        opacity: aboutTextOpacity,
        transition: 'none' // Disable default transitions for smooth scroll control
      }}
      className="w-full relative z-10"
    >
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
      </div>
    </div>
  );
};

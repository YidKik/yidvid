
import React from 'react';

export const AboutSection = () => {
  return (
    <section className="bg-[#135d66] px-6 py-16">
      <div className="container mx-auto grid grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h2 className="text-6xl font-display text-white">About</h2>
          <div className="space-y-6 text-lg text-brand-light">
            <p>
              We understand the importance of providing a safe and enjoyable platform
              for individuals and families to access entertainment content that aligns with
              their values. Our team is dedicated to curating a diverse range of videos that
              cater to a wide audience, while ensuring that all content meets our strict
              guidelines for kosher entertainment.
            </p>
            <p>
              By offering a free platform for users to create an account and access our content,
              we aim to make it easy for everyone to enjoy the latest videos in a
              secure environment. Our commitment to staying up-to-date with the latest
              trends and updates in the entertainment industry ensures that we are always
              bringing you the best content available.
            </p>
            <p>
              At YidVid, we take pride in our attention to detail and commitment to providing
              top-quality entertainment options for our users. We strive to maintain
              the highest level of standards in everything we do, so you can trust that you
              are getting nothing but the best when you visit our site. Thank you for
              choosing YidVid as your go-to source for kosher entertainment content.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="relative w-96 h-96">
            <div className="absolute inset-0 bg-brand-dark rounded-3xl transform rotate-6"></div>
            <div className="absolute inset-0 bg-brand-light/20 rounded-3xl transform -rotate-3"></div>
            <div className="relative flex items-center justify-center h-full">
              <img
                src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
                alt="YidVid Logo"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


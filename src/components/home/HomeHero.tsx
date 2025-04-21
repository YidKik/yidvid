
import React from "react";

export const HomeHero = () => {
  return (
    <div className="flex flex-col items-center md:items-start px-6 md:pl-16">
      {/* Logo */}
      <img
        src="/lovable-uploads/e3f1c50b-8945-4b12-977d-c47c9d1c7083.png"
        alt="YidVid Logo"
        className="w-44 md:w-52 h-auto mb-3 mx-auto md:mx-0"
        draggable={false}
      />

      {/* Welcome and Text */}
      <h1 className="text-center md:text-left text-3xl md:text-5xl font-bold mb-3 mt-2">
        <span className="text-[#ea384c]">Welcome to YidVid</span>
      </h1>
      <div className="text-center md:text-left text-lg md:text-2xl text-gray-700 max-w-md mb-1">
        Your gateway to curated Jewish content.
      </div>
      <p className="text-center md:text-left text-base md:text-lg text-gray-600 opacity-95 mb-3">
        Discover videos that inspire, entertain, and connect.
      </p>
    </div>
  );
};

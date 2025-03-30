
import React, { useState } from 'react';

interface VideoPlaceholderProps {
  size?: 'small' | 'medium' | 'large';
}

export const VideoPlaceholder = ({ size = 'medium' }: VideoPlaceholderProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Determine image size based on the size prop - with very large sizes for visibility
  const imgClass = size === 'small' ? 'h-48 w-auto' : 
                  size === 'large' ? 'h-128 w-auto' : 
                  'h-80 w-auto';
  
  // Use the uploaded image
  const primaryLogo = "/lovable-uploads/5a9bf84a-3676-46bf-b5f1-395e96175e82.png";
  const fallbackLogo = "/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png";
  
  return (
    <div className="h-full w-full flex items-center justify-center bg-transparent">
      <img
        src={imageError ? fallbackLogo : primaryLogo}
        alt="YidVid"
        className={`${imgClass} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 animate-fade-in`}
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          console.error("Video placeholder image failed to load:", e);
          setImageError(true);
          // Switch to fallback logo
          e.currentTarget.src = fallbackLogo;
        }}
      />
      
      {/* Show static fallback while main image is loading */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={fallbackLogo} 
            alt="YidVid Fallback" 
            className={imgClass.replace('h-', 'h-[90%] max-h-')}
          />
        </div>
      )}
    </div>
  );
};


import React from 'react';

interface VideoPlaceholderProps {
  size?: 'small' | 'medium' | 'large';
}

export const VideoPlaceholder = ({ size = 'medium' }: VideoPlaceholderProps) => {
  // Determine image size based on the size prop - now with larger sizes
  const imgClass = size === 'small' ? 'h-32 w-auto' : 
                  size === 'large' ? 'h-96 w-auto' : 
                  'h-64 w-auto';
  
  return (
    <div className="h-full w-full flex items-center justify-center bg-transparent">
      <img
        src="/lovable-uploads/5a9bf84a-3676-46bf-b5f1-395e96175e82.png"
        alt="YidVid"
        className={imgClass}
      />
    </div>
  );
};


import React from 'react';

interface VideoPlaceholderProps {
  size?: 'small' | 'medium' | 'large';
}

export const VideoPlaceholder = ({ size = 'medium' }: VideoPlaceholderProps) => {
  // Determine image size based on the size prop
  const imgClass = size === 'small' ? 'h-8 w-auto' : 
                  size === 'large' ? 'h-20 w-auto' : 
                  'h-12 w-auto';
  
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#9e9e9e] rounded-lg">
      <img
        src="/lovable-uploads/42b6bf6a-9833-47de-ae22-5c9e183e66d0.png"
        alt="Video unavailable"
        className={imgClass}
      />
    </div>
  );
};


import React from 'react';

interface VideoPlaceholderProps {
  size?: 'small' | 'medium' | 'large';
}

export const VideoPlaceholder = ({ size = 'medium' }: VideoPlaceholderProps) => {
  // Determine image size based on the size prop
  const imgClass = size === 'small' ? 'h-16 w-auto' : 
                  size === 'large' ? 'h-40 w-auto' : 
                  'h-24 w-auto';
  
  return (
    <div className="h-full w-full flex items-center justify-center">
      <img
        src="/lovable-uploads/42b6bf6a-9833-47de-ae22-5c9e183e66d0.png"
        alt="Video unavailable"
        className={imgClass}
      />
    </div>
  );
};

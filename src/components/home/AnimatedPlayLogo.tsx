import React from 'react';
import yidvidLogoIcon from '@/assets/yidvid-logo-icon.png';

interface AnimatedPlayLogoProps {
  className?: string;
}

export const AnimatedPlayLogo: React.FC<AnimatedPlayLogoProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <img
        src={yidvidLogoIcon}
        alt="YidVid Logo"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
};

export default AnimatedPlayLogo;


import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

interface HeaderLogoProps {
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const HeaderLogo = ({ isMobile, isMobileMenuOpen, onMobileMenuToggle }: HeaderLogoProps) => {
  // Get device info directly as a backup in case props are inconsistent
  const deviceInfo = useIsMobile();
  const isActuallyMobile = deviceInfo.isMobile;
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  // Reset logo state when mobile status changes for proper reloading
  useEffect(() => {
    setLogoLoaded(false);
    setLogoError(false);
  }, [isMobile]);

  // Log any inconsistencies for debugging
  if (isMobile !== isActuallyMobile) {
    console.warn("HeaderLogo received inconsistent mobile status:", { propsMobile: isMobile, actualMobile: isActuallyMobile });
  }

  return (
    <div className={`flex items-center ${isMobile ? '' : 'absolute left-0 top-1/2 -translate-y-1/2 ml-0 pl-0'}`}>
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
          alt="YidVid Logo"
          className={`object-contain drop-shadow-md transition-opacity duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'} ${isMobile ? 'h-28 w-auto animate-logo-pulse' : 'h-32 w-auto'}`}
          onLoad={() => setLogoLoaded(true)}
          onError={(e) => {
            console.error('Logo failed to load:', e);
            setLogoError(true);
            // Use a direct fallback to the secondary logo
            e.currentTarget.src = "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png";
            // Try to load the fallback
            setTimeout(() => setLogoLoaded(true), 100);
          }}
        />
        
        {/* Show fallback while main logo is loading */}
        {!logoLoaded && (
          <img 
            src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png"
            alt="YidVid Placeholder" 
            className={`object-contain absolute ${isMobile ? 'h-24 w-auto' : 'h-28 w-auto'}`}
          />
        )}
      </Link>
    </div>
  );
};

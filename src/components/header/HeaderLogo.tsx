
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderLogoProps {
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const HeaderLogo = ({ isMobile, isMobileMenuOpen, onMobileMenuToggle }: HeaderLogoProps) => {
  const deviceInfo = useIsMobile();
  const isActuallyMobile = deviceInfo.isMobile;
  
  if (isMobile !== isActuallyMobile) {
    console.warn("HeaderLogo received inconsistent mobile status:", { propsMobile: isMobile, actualMobile: isActuallyMobile });
  }

  return (
    <div className={`flex items-center ${isMobile ? 'ml-2' : 'absolute left-0 top-1/2 -translate-y-1/2 ml-4'}`}>
      <Link to="/" className="flex items-center">
        <img 
          src="/yidkik-logo.png" 
          alt="YidVid Logo" 
          className={`${isMobile ? 'h-8' : 'h-10'} w-auto`} 
        />
      </Link>
    </div>
  );
};

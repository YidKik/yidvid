
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
    <div className={`flex items-center ${isMobile ? '' : 'absolute left-0 top-1/2 -translate-y-1/2 ml-0 pl-0'}`}>
      <Link to="/" className="flex items-center text-xl font-bold text-gray-800">
        YidVid
      </Link>
    </div>
  );
};

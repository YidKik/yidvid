
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderLogoProps {
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const HeaderLogo = ({ isMobile }: HeaderLogoProps) => {
  return (
    <div className={`flex items-center ${isMobile ? '' : 'absolute left-0 top-1/2 -translate-y-1/2 ml-0 pl-0'}`}>
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
          alt="YidVid Logo"
          className={`object-contain drop-shadow-md ${isMobile ? 'h-28 w-auto animate-logo-pulse' : 'h-32 w-auto'}`}
          onError={(e) => {
            console.error('Logo failed to load:', e);
            // Use a direct fallback to the secondary logo
            e.currentTarget.src = "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png";
          }}
        />
      </Link>
    </div>
  );
};

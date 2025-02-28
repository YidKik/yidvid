
import { Link } from "react-router-dom";

interface HeaderLogoProps {
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const HeaderLogo = ({ isMobile }: HeaderLogoProps) => {
  return (
    <div className="flex items-center absolute left-0 top-1/2 -translate-y-1/2 ml-0 pl-0">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
          alt="YidVid Logo"
          className={`object-contain ${isMobile ? 'h-[110px] w-[110px]' : 'h-36 w-auto'}`}
          onError={(e) => {
            console.error('Logo failed to load:', e);
            e.currentTarget.src = 'none';
          }}
        />
      </Link>
    </div>
  );
};

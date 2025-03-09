
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
          src="/lovable-uploads/2df6b540-f798-4831-8fcc-255a55486aa0.png" 
          alt="YidVid Logo"
          className={`object-contain ${isMobile ? 'h-[110px] w-[110px]' : 'h-36 w-auto'}`}
          onError={(e) => {
            console.error('Logo failed to load:', e);
            e.currentTarget.src = '/favicon.ico';
          }}
        />
      </Link>
    </div>
  );
};

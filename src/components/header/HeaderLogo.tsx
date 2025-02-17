
import { Link } from "react-router-dom";

interface HeaderLogoProps {
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const HeaderLogo = ({ isMobile }: HeaderLogoProps) => {
  return (
    <div className="flex items-center gap-2">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
          alt="YidVid Logo"
          className="h-24 w-auto object-contain md:h-28" // Increased height from h-20/h-24 to h-24/h-28
          onError={(e) => {
            console.error('Logo failed to load:', e);
            e.currentTarget.src = 'none';
          }}
        />
      </Link>
    </div>
  );
};

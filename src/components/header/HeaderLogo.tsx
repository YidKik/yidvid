
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
          className="h-16 w-auto object-contain md:h-20" // Increased height from h-12/h-14 to h-16/h-20
          onError={(e) => {
            console.error('Logo failed to load:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
      </Link>
    </div>
  );
};

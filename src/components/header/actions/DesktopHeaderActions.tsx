
import { Button } from "@/components/ui/button";
import { LogIn, MessageSquare, Settings } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";
import { UserMenu } from "../UserMenu";
import { ContactDialog } from "../../contact/ContactDialog";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface DesktopHeaderActionsProps {
  session: any;
  onAuthOpen: () => void;
  onLogout: () => Promise<void>;
  onMarkNotificationsAsRead: () => Promise<void>;
  handleSettingsClick: () => void;
  onContactOpen: () => void;
}

export const DesktopHeaderActions = ({
  session,
  onAuthOpen,
  onLogout,
  onMarkNotificationsAsRead,
  handleSettingsClick,
  onContactOpen
}: DesktopHeaderActionsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isVideosPage = location.pathname.startsWith("/videos");
  const isSearchPage = location.pathname.startsWith("/search");
  
  // Detect tablet view (768px - 1024px)
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width <= 1024);
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  // Use filled style (solid red circle) on videos and search pages
  const isFilled = isVideosPage || isSearchPage;
  // Keep only sizing/rounding here; background comes from variant when filled
  const buttonBaseClass = `h-9 w-9 rounded-full ${!isFilled ? 'bg-[#222222] hover:bg-[#333333] text-primary' : ''}`;

  return (
    <div className="flex items-center gap-3">
      {session && <NotificationsMenu onMarkAsRead={onMarkNotificationsAsRead} />}
      
      {/* Hide contact button on tablet to prevent overlap with search bar */}
      {!isTablet && (
        <Button 
          onClick={onContactOpen}
          variant={isFilled ? "default" : "ghost"}
          size="icon"
          className={buttonBaseClass}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      )}
      
      {session ? (
        <Button 
          onClick={handleSettingsClick}
          className={buttonBaseClass}
          variant={isFilled ? "default" : "ghost"}
          size="icon"
        >
          <Settings className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          onClick={onAuthOpen}
          className={buttonBaseClass}
          variant={isFilled ? "default" : "ghost"}
          size="icon"
        >
          <LogIn className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

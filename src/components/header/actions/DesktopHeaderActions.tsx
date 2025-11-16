
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
  const isVideosPage = location.pathname === "/videos";
  const isSearchPage = location.pathname === "/search";
  
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

  // Consistent button styling for all buttons - use primary colors on videos and search pages
  const buttonBaseClass = `h-9 w-9 rounded-full ${(isVideosPage || isSearchPage)
    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
    : 'bg-[#222222] hover:bg-[#333333] text-primary'}`;

  return (
    <div className="flex items-center gap-3">
      {session && <NotificationsMenu onMarkAsRead={onMarkNotificationsAsRead} />}
      
      {/* Hide contact button on tablet to prevent overlap with search bar */}
      {!isTablet && (
        <Button 
          onClick={onContactOpen}
          variant="ghost" 
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
          variant="ghost"
          size="icon"
        >
          <Settings className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          onClick={onAuthOpen}
          className={buttonBaseClass}
          variant="ghost"
          size="icon"
        >
          <LogIn className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

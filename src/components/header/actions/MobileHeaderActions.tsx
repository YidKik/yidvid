
import { Button } from "@/components/ui/button";
import { LogIn, Settings } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useSessionManager } from "@/hooks/useSessionManager";
import { ContactDialog } from "@/components/contact/ContactDialog";

interface MobileHeaderActionsProps {
  onAuthOpen: () => void;
  onMarkNotificationsAsRead: () => Promise<void>;
  handleSettingsClick: () => void;
  onLogout: () => Promise<void>;
}

export const MobileHeaderActions = ({
  onAuthOpen,
  onMarkNotificationsAsRead,
  handleSettingsClick,
  onLogout
}: MobileHeaderActionsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSessionManager();
  const isVideosPage = location.pathname === "/videos";
  const isHomePage = location.pathname === "/" || location.pathname === "";
  
  // Use different styling for home page vs videos page
  const buttonClass = isHomePage 
    ? "bg-transparent hover:bg-[#135d66] text-white"
    : isVideosPage 
      ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
      : 'bg-[#222222] hover:bg-[#333333] text-white';

  return (
    <div className="flex items-center gap-1.5">
      {isAuthenticated ? (
        <>
          <NotificationsMenu onMarkNotificationsAsRead={onMarkNotificationsAsRead} />
          <ContactDialog />
          <Button
            onClick={handleSettingsClick}
            variant="ghost" 
            size="sm"
            className={`${buttonClass} text-[0.7rem] rounded-full flex items-center px-2 py-1`}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <ContactDialog />
          <Button
            onClick={onAuthOpen}
            variant="ghost" 
            size="sm"
            className={`${buttonClass} text-[0.7rem] rounded-full flex items-center px-2 py-1`}
          >
            <LogIn className="h-3 w-3" />
            <span className="ml-1">Sign in</span>
          </Button>
        </>
      )}
    </div>
  );
};


import { Button } from "@/components/ui/button";
import { LogIn, MessageSquare, Settings } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";
import { useLocation, useNavigate } from "react-router-dom";

interface MobileHeaderActionsProps {
  session: any;
  onAuthOpen: () => void;
  onMarkNotificationsAsRead: () => Promise<void>;
  handleSettingsClick: () => void;
  onLogout: () => Promise<void>;
}

export const MobileHeaderActions = ({
  session,
  onAuthOpen,
  onMarkNotificationsAsRead,
  handleSettingsClick,
  onLogout
}: MobileHeaderActionsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isVideosPage = location.pathname === "/videos";
  const isHomePage = location.pathname === "/" || location.pathname === "";
  
  // Use different styling for home page vs other pages
  const buttonClass = isHomePage 
    ? "bg-transparent hover:bg-[#135d66] text-white"
    : isVideosPage 
      ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
      : 'bg-[#222222] hover:bg-[#333333] text-white';

  return (
    <div className="flex items-center gap-2.5">
      {session ? (
        <>
          <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />
          <Button
            onClick={handleSettingsClick}
            variant="ghost" 
            size="sm"
            className={`${buttonClass} text-xs rounded-md transition-all duration-300 mobile-button-animate flex items-center gap-1 px-2 py-1`}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="ghost" 
            size="icon"
            className={`${buttonClass} h-6 w-6 rounded-md transition-all duration-300 mobile-button-animate`}
            onClick={() => {
              const contactDialog = document.querySelector('[data-state="closed"][role="dialog"]');
              if (contactDialog) {
                (contactDialog as HTMLElement).click();
              }
            }}
          >
            <MessageSquare className="h-3 w-3" />
          </Button>
          <Button
            onClick={onAuthOpen}
            variant="ghost" 
            size="sm"
            className={`${buttonClass} text-xs rounded-md transition-all duration-300 mobile-button-animate flex items-center gap-1 px-2 py-1`}
          >
            <LogIn className="h-3 w-3" />
            <span>Sign in</span>
          </Button>
        </>
      )}
    </div>
  );
};

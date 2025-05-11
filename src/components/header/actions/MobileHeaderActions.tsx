
import { Button } from "@/components/ui/button";
import { LogIn, MessageSquare } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";
import { UserMenu } from "../UserMenu";
import { useLocation } from "react-router-dom";

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
  const isVideosPage = location.pathname === "/videos";
  const isHomePage = location.pathname === "/" || location.pathname === "";
  
  // Use different styling for home page vs other pages
  const buttonClass = isHomePage 
    ? "bg-transparent hover:bg-[#135d66] text-white"
    : isVideosPage 
      ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
      : 'bg-[#222222] hover:bg-[#333333] text-white';

  return (
    <div className="flex items-center gap-2">
      {session ? (
        <>
          <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />
          <UserMenu onLogout={onLogout} />
        </>
      ) : (
        <>
          <Button 
            variant="ghost" 
            size="icon"
            className={`${buttonClass} h-7 w-7 rounded-md transition-all duration-300 mobile-button-animate`}
            onClick={() => {
              const contactDialog = document.querySelector('[data-state="closed"][role="dialog"]');
              if (contactDialog) {
                (contactDialog as HTMLElement).click();
              }
            }}
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={onAuthOpen}
            variant="ghost" 
            size="icon"
            className={`${buttonClass} h-7 w-7 rounded-md transition-all duration-300 mobile-button-animate`}
          >
            <LogIn className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
};

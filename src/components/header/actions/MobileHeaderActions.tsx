
import { Button } from "@/components/ui/button";
import { LogIn, Settings, User } from "lucide-react";
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
  
  // Use different styling for home page vs videos page
  const buttonClass = isHomePage 
    ? "bg-transparent hover:bg-surface-hover text-brand"
    : isVideosPage 
      ? 'bg-primary hover:bg-[#c82d3f] text-primary-foreground' 
      : 'bg-secondary hover:bg-surface-active text-primary';

  return (
    <div className="flex items-center gap-1">
      {session ? (
        <>
          <NotificationsMenu onMarkAsRead={onMarkNotificationsAsRead} />
          <Button
            onClick={handleSettingsClick}
            variant="ghost" 
            size="sm"
            className={`${buttonClass} text-[0.7rem] rounded-control flex items-center w-7 h-7 min-w-0 p-0`}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={onAuthOpen}
            variant="ghost" 
            size="sm"
            className={`${buttonClass} text-[0.6rem] rounded-control flex items-center px-1.5 py-0.5 gap-0.5`}
          >
            <User className="h-2.5 w-2.5" />
            <span className="hidden min-[360px]:inline">Sign in</span>
          </Button>
        </>
      )}
    </div>
  );
};

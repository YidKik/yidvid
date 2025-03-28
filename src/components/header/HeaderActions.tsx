import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { ContactDialog } from "../contact/ContactDialog";
import { LogIn, MessageSquare, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderActionsProps {
  isMobile: boolean;
  isSearchExpanded: boolean;
  session: any;
  onSearchExpand: () => void;
  onAuthOpen: () => void;
  onLogout: () => Promise<void>;
  onMarkNotificationsAsRead: () => Promise<void>;
  onSettingsClick?: () => void;
}

export const HeaderActions = ({
  isMobile,
  isSearchExpanded,
  onSearchExpand,
  onAuthOpen,
  onLogout,
  session,
  onMarkNotificationsAsRead,
  onSettingsClick
}: HeaderActionsProps) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate("/settings");
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        {session ? (
          <>
            <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />
            <Button
              onClick={handleSettingsClick}
              variant="ghost" 
              size="icon"
              className="bg-[#222222] hover:bg-[#333333] text-white h-7 w-7 rounded-md transition-all duration-300 mobile-button-animate"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-[#222222] hover:bg-[#333333] text-white h-7 w-7 rounded-md transition-all duration-300 mobile-button-animate"
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
              className="bg-[#222222] hover:bg-[#333333] text-white h-7 w-7 rounded-md transition-all duration-300 mobile-button-animate"
            >
              <LogIn className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="flex items-center gap-3">
        {session && <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />}
        
        <ContactDialog />
        
        {session ? (
          <div onClick={handleSettingsClick}>
            <UserMenu onLogout={onLogout} />
          </div>
        ) : (
          <Button 
            onClick={onAuthOpen}
            className="bg-[#222222] hover:bg-[#333333] text-white h-10 w-10 rounded-md flex items-center justify-center"
            variant="ghost"
            size="icon"
          >
            <LogIn className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  }

  return null;
};


import { Button } from "@/components/ui/button";
import { LogIn, MessageSquare, Settings } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";
import { UserMenu } from "../UserMenu";
import { ContactDialog } from "../../contact/ContactDialog";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface DesktopHeaderActionsProps {
  session: any;
  onAuthOpen: () => void;
  onLogout: () => Promise<void>;
  onMarkNotificationsAsRead: () => Promise<void>;
  handleSettingsClick: () => void;
}

export const DesktopHeaderActions = ({
  session,
  onAuthOpen,
  onLogout,
  onMarkNotificationsAsRead,
  handleSettingsClick
}: DesktopHeaderActionsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isVideosPage = location.pathname === "/videos";

  return (
    <div className="flex items-center gap-3">
      {session && <NotificationsMenu onMarkAsRead={onMarkNotificationsAsRead} />}
      
      <Button 
        onClick={() => {
          const contactDialog = document.querySelector('[data-state="closed"][role="dialog"]');
          if (contactDialog) {
            (contactDialog as HTMLElement).click();
          }
        }}
        variant="ghost" 
        size="icon"
        className={`h-9 w-9 rounded-full ${isVideosPage 
          ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
          : 'bg-[#222222] hover:bg-[#333333] text-white'}`}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      
      {session ? (
        <Button 
          onClick={handleSettingsClick}
          className={`${isVideosPage 
            ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
            : 'bg-[#222222] hover:bg-[#333333] text-white'} rounded-full flex items-center justify-center px-3 py-2 h-9`}
          variant="ghost"
        >
          <Settings className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          onClick={onAuthOpen}
          className={`${isVideosPage 
            ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
            : 'bg-[#222222] hover:bg-[#333333] text-white'} rounded-full flex items-center justify-center px-3 py-2 h-9`}
          variant="ghost"
        >
          <LogIn className="h-4 w-4 mr-1.5" />
          <span className="text-sm">Sign in</span>
        </Button>
      )}
    </div>
  );
};

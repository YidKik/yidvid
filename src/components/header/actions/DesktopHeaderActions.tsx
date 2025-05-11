
import { Button } from "@/components/ui/button";
import { LogIn, MessageSquare, LogOut } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";
import { UserMenu } from "../UserMenu";
import { ContactDialog } from "../../contact/ContactDialog";
import { useLocation } from "react-router-dom";

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
  const isVideosPage = location.pathname === "/videos";

  return (
    <div className="flex items-center gap-3">
      {session && <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />}
      
      <Button 
        onClick={() => {
          const contactDialog = document.querySelector('[data-state="closed"][role="dialog"]');
          if (contactDialog) {
            (contactDialog as HTMLElement).click();
          }
        }}
        variant="ghost" 
        size="icon"
        className={`h-10 w-10 ${isVideosPage 
          ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
          : 'bg-[#222222] hover:bg-[#333333] text-white'}`}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
      
      {session ? (
        <Button 
          onClick={onLogout}
          className={`${isVideosPage 
            ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
            : 'bg-[#222222] hover:bg-[#333333] text-white'} rounded-md flex items-center justify-center px-4`}
          variant="ghost"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Sign out</span>
        </Button>
      ) : (
        <Button 
          onClick={onAuthOpen}
          className={`${isVideosPage 
            ? 'bg-[#ea384c] hover:bg-[#c82d3f] text-white' 
            : 'bg-[#222222] hover:bg-[#333333] text-white'} rounded-md flex items-center justify-center px-4`}
          variant="ghost"
        >
          <LogIn className="h-5 w-5 mr-2" />
          <span>Sign in</span>
        </Button>
      )}
    </div>
  );
};

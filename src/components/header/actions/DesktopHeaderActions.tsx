
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
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
      
      <ContactDialog />
      
      {session ? (
        <UserMenu onLogout={onLogout} />
      ) : (
        <Button 
          onClick={onAuthOpen}
          className={isVideosPage 
            ? "bg-[#ea384c] hover:bg-[#c82d3f] text-white h-10 w-10 rounded-md flex items-center justify-center" 
            : "bg-[#222222] hover:bg-[#333333] text-white h-10 w-10 rounded-md flex items-center justify-center"}
          variant="ghost"
          size="icon"
        >
          <LogIn className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

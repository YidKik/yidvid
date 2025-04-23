
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";
import { UserMenu } from "../UserMenu";
import { ContactDialog } from "../../contact/ContactDialog";

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
  return (
    <div className="flex items-center gap-3">
      {/* Always show Contact Us button */}
      <ContactDialog />
      {session && (
        <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />
      )}
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
};

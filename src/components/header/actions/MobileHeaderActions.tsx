
import { Button } from "@/components/ui/button";
import { LogIn, Settings } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";
import { ContactDialog } from "../../contact/ContactDialog";
import { UserMenu } from "../UserMenu";

interface MobileHeaderActionsProps {
  session: any;
  onAuthOpen: () => void;
  onMarkNotificationsAsRead: () => Promise<void>;
  handleSettingsClick: () => void;
  onLogout?: () => Promise<void>;
}

export const MobileHeaderActions = ({
  session,
  onAuthOpen,
  onMarkNotificationsAsRead,
  handleSettingsClick,
  onLogout,
}: MobileHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Contact Us always visible */}
      <ContactDialog />
      {session ? (
        <>
          <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />
          <UserMenu onLogout={onLogout!} />
        </>
      ) : (
        <>
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
};


import { Button } from "@/components/ui/button";
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
  // handleSettingsClick not used anymore for UserMenu popover
}: DesktopHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* Always show Contact Us button */}
      <ContactDialog />
      {/* Show notifications (if logged in) */}
      {session && (
        <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />
      )}
      {/* Show settings icon for user menu */}
      {session ? (
        <UserMenu onLogout={onLogout} showSettingsIcon={true} />
      ) : (
        <Button 
          onClick={onAuthOpen}
          className="bg-[#222222] hover:bg-[#333333] text-white h-10 w-10 rounded-md flex items-center justify-center"
          variant="ghost"
          size="icon"
        >
          {/* Lucide LogIn icon */}
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
        </Button>
      )}
    </div>
  );
};

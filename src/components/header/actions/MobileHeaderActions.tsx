
import { Button } from "@/components/ui/button";
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
  onLogout,
}: MobileHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Always show Contact Us button */}
      <ContactDialog />
      {session ? (
        <>
          <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />
          {/* Avatar popover always visible when logged in */}
          <UserMenu onLogout={onLogout!} />
        </>
      ) : (
        <Button
          onClick={onAuthOpen}
          variant="ghost"
          size="icon"
          className="bg-[#222222] hover:bg-[#333333] text-white h-7 w-7 rounded-md transition-all duration-300 mobile-button-animate"
        >
          {/* Lucide LogIn icon */}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
        </Button>
      )}
    </div>
  );
};

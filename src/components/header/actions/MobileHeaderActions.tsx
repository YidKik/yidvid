
import { Button } from "@/components/ui/button";
import { LogIn, MessageSquare, Settings } from "lucide-react";
import { NotificationsMenu } from "../NotificationsMenu";

interface MobileHeaderActionsProps {
  session: any;
  onAuthOpen: () => void;
  onMarkNotificationsAsRead: () => Promise<void>;
  handleSettingsClick: () => void;
}

export const MobileHeaderActions = ({
  session,
  onAuthOpen,
  onMarkNotificationsAsRead,
  handleSettingsClick
}: MobileHeaderActionsProps) => {
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
};

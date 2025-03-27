import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { ContactDialog } from "../contact/ContactDialog";
import { LogIn, MessageSquare } from "lucide-react";
import { Separator } from "../ui/separator";

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
  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <ContactDialog />
        
        {session ? (
          <div onClick={onSettingsClick}>
            <UserMenu onLogout={onLogout} />
          </div>
        ) : (
          <Button
            onClick={onAuthOpen}
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-full bg-white/90 shadow-sm border border-[#ea384c]"
          >
            <LogIn className="h-3.5 w-3.5 text-black" />
          </Button>
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
          <div onClick={onSettingsClick}>
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

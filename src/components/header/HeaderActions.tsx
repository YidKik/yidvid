
import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { ContactDialog } from "../contact/ContactDialog";
import { ChevronDown } from "lucide-react";

interface HeaderActionsProps {
  isMobile: boolean;
  isSearchExpanded: boolean;
  session: any;
  onSearchExpand: () => void;
  onMarkNotificationsAsRead: () => Promise<void>;
  onLogout: () => Promise<void>;
  onAuthOpen: () => void;
}

export const HeaderActions = ({
  isMobile,
  isSearchExpanded,
  session,
  onSearchExpand,
  onMarkNotificationsAsRead,
  onLogout,
  onAuthOpen
}: HeaderActionsProps) => {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {isMobile && !isSearchExpanded ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchExpand}
          className="mr-1"
        >
          <ChevronDown className="h-5 w-5 text-gray-600" />
        </Button>
      ) : null}

      {!isMobile && <ContactDialog />}

      {session ? (
        <>
          <NotificationsMenu 
            session={session}
            onMarkAsRead={onMarkNotificationsAsRead}
          />
          <UserMenu onLogout={onLogout} />
        </>
      ) : (
        <Button 
          onClick={onAuthOpen}
          className="h-8 text-sm px-3"
          variant="default"
        >
          Login
        </Button>
      )}
    </div>
  );
};

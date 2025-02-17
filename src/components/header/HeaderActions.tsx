
import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { ContactDialog } from "../contact/ContactDialog";
import { Search } from "lucide-react";

interface HeaderActionsProps {
  isMobile: boolean;
  isSearchExpanded: boolean;
  session: any;
  onSearchExpand: () => void;
  onAuthOpen: () => void;
}

export const HeaderActions = ({
  isMobile,
  isSearchExpanded,
  onSearchExpand,
  onAuthOpen,
  session
}: HeaderActionsProps) => {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {isMobile ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchExpand}
          className="hover:bg-transparent"
        >
          <Search className="h-5 w-5 text-[#ea384c]" />
        </Button>
      ) : (
        <>
          <ContactDialog />
          {session && <NotificationsMenu session={session} onMarkAsRead={async () => {}} />}
          {session && <UserMenu onLogout={async () => {}} />}
        </>
      )}

      {!session && !isMobile && (
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

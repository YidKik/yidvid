
import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { ContactDialog } from "../contact/ContactDialog";
import { Search, LogIn, MessageSquare, Bell, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "../ui/separator";

interface HeaderActionsProps {
  isMobile: boolean;
  isSearchExpanded: boolean;
  session: any;
  onSearchExpand: () => void;
  onAuthOpen: () => void;
  onLogout: () => Promise<void>;
  onMarkNotificationsAsRead: () => Promise<void>;
}

export const HeaderActions = ({
  isMobile,
  isSearchExpanded,
  onSearchExpand,
  onAuthOpen,
  onLogout,
  session,
  onMarkNotificationsAsRead
}: HeaderActionsProps) => {
  if (isMobile && !isSearchExpanded) {
    return (
      <div className="absolute right-2 flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchExpand}
          className="h-6 w-6 hover:bg-gray-100 rounded-full"
        >
          <Search className="h-3 w-3 text-gray-600" />
        </Button>

        {session ? (
          <UserMenu onLogout={onLogout} />
        ) : (
          <Button
            onClick={onAuthOpen}
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-gray-100 rounded-full"
          >
            <LogIn className="h-3 w-3 text-gray-600" />
          </Button>
        )}
        
        <ContactDialog />
        
        {session && (
          <NotificationsMenu 
            session={session} 
            onMarkAsRead={onMarkNotificationsAsRead}
          />
        )}
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="flex items-center gap-2 ml-auto">
        <ContactDialog />
        {session && <NotificationsMenu session={session} onMarkAsRead={onMarkNotificationsAsRead} />}
        {session ? (
          <UserMenu onLogout={onLogout} />
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
  }

  return null;
};

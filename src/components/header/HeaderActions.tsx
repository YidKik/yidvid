
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
      <div className="flex items-center gap-2">
        {session && (
          <>
            <NotificationsMenu 
              session={session} 
              onMarkAsRead={onMarkNotificationsAsRead}
            />
            <Separator orientation="vertical" className="h-6 bg-gray-200/60" />
          </>
        )}
        
        <ContactDialog />
        
        <Separator orientation="vertical" className="h-6 bg-gray-200/60" />
        
        {session ? (
          <UserMenu onLogout={onLogout} />
        ) : (
          <Button
            onClick={onAuthOpen}
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-gray-100 rounded-full"
          >
            <LogIn className="h-3.5 w-3.5 text-gray-600" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchExpand}
          className="h-7 w-7 hover:bg-gray-100 rounded-full"
        >
          <Search className="h-3.5 w-3.5 text-gray-600" />
        </Button>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="flex items-center gap-2">
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

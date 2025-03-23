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
  if (isMobile && !isSearchExpanded) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchExpand}
          className="h-6 w-6 hover:bg-gray-100 rounded-full"
        >
          <Search className="h-3 w-3 text-gray-600" />
        </Button>

        {session && (
          <NotificationsMenu 
            session={session} 
            onMarkAsRead={onMarkNotificationsAsRead}
          />
        )}
        
        <ContactDialog />
        
        {session ? (
          <div onClick={onSettingsClick}>
            <UserMenu onLogout={onLogout} />
          </div>
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

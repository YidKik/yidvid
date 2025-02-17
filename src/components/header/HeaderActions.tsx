
import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { ContactDialog } from "../contact/ContactDialog";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      {isMobile && !isSearchExpanded ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute left-1/2 -translate-x-1/2 flex items-center h-14"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchExpand}
              className="hover:bg-gray-100 rounded-full w-8 h-8 p-1.5 flex items-center justify-center"
            >
              <Search className="h-4 w-4 text-black" />
            </Button>
          </motion.div>
        </AnimatePresence>
      ) : !isMobile && (
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


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
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchExpand}
              className="hover:bg-transparent absolute left-1/2 -translate-x-1/2"
            >
              <Search className="h-5 w-5 text-[#ea384c]" />
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

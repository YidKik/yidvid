
import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { ContactDialog } from "../contact/ContactDialog";
import { Search, LogIn, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderActionsProps {
  isMobile: boolean;
  isSearchExpanded: boolean;
  session: any;
  onSearchExpand: () => void;
  onAuthOpen: () => void;
  onLogout: () => Promise<void>;
}

export const HeaderActions = ({
  isMobile,
  isSearchExpanded,
  onSearchExpand,
  onAuthOpen,
  onLogout,
  session
}: HeaderActionsProps) => {
  return (
    <div className="flex items-center gap-1 md:gap-2 absolute right-2 top-1/2 -translate-y-1/2 z-10">
      {isMobile && !isSearchExpanded ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-1.5"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchExpand}
              className="hover:bg-gray-100 rounded-full w-6 h-6 p-1 flex items-center justify-center"
            >
              <Search className="h-3.5 w-3.5 text-black" />
            </Button>

            {!session ? (
              <Button
                onClick={onAuthOpen}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 rounded-full w-6 h-6 p-1 flex items-center justify-center"
              >
                <LogIn className="h-3.5 w-3.5 text-black" />
              </Button>
            ) : (
              <Button
                onClick={onLogout}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 rounded-full w-6 h-6 p-1 flex items-center justify-center"
              >
                <LogOut className="h-3.5 w-3.5 text-black" />
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      ) : !isMobile && (
        <>
          <ContactDialog />
          {session && <NotificationsMenu session={session} onMarkAsRead={async () => {}} />}
          {session && <UserMenu onLogout={onLogout} />}
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


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/header/UserMenu";
import { NotificationsMenu } from "@/components/header/NotificationsMenu";
import { useSessionManager } from "@/hooks/useSessionManager";
import { ContactDialog } from "@/components/contact/ContactDialog";
import { LogIn } from "lucide-react";

interface DesktopHeaderActionsProps {
  onAuthOpen?: () => void;
  onLogout?: () => Promise<void>;
  onMarkNotificationsAsRead?: () => Promise<void>;
  handleSettingsClick?: () => void;
}

export function DesktopHeaderActions({
  onLogout,
  onAuthOpen,
  onMarkNotificationsAsRead,
  handleSettingsClick
}: DesktopHeaderActionsProps) {
  const { isAuthenticated, isLoading } = useSessionManager();

  return (
    <div className="hidden md:flex gap-3 items-center">
      {!isLoading && (
        <>
          {isAuthenticated ? (
            <div className="flex gap-3 items-center">
              <ContactDialog />
              <NotificationsMenu onMarkNotificationsAsRead={onMarkNotificationsAsRead} />
              <UserMenu onLogout={onLogout || (() => Promise.resolve())} handleSettingsClick={handleSettingsClick} />
            </div>
          ) : (
            <>
              <ContactDialog />
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 px-3 py-1"
                onClick={onAuthOpen}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

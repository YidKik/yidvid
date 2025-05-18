
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/header/UserMenu";
import { NotificationsMenu } from "@/components/header/NotificationsMenu";
import { useSessionManager } from "@/hooks/useSessionManager";
import { ContactDialog } from "@/components/contact/ContactDialog";

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
    <div className="hidden md:flex gap-2 items-center">
      {!isLoading && (
        <>
          {isAuthenticated ? (
            <div className="flex gap-2">
              <ContactDialog />
              <NotificationsMenu onMarkNotificationsAsRead={onMarkNotificationsAsRead || (() => Promise.resolve())} />
              <UserMenu onLogout={onLogout || (() => Promise.resolve())} />
            </div>
          ) : (
            <>
              <ContactDialog />
              <Link to="/auth" onClick={onAuthOpen}>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </>
      )}
    </div>
  );
}

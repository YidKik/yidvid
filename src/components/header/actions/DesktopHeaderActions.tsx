
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/header/SearchBar";
import { UserMenu } from "@/components/header/UserMenu";
import { NotificationsMenu } from "@/components/header/NotificationsMenu";
import { useSessionManager } from "@/hooks/useSessionManager";

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
      <SearchBar />

      {!isLoading && (
        <>
          {isAuthenticated ? (
            <div className="flex gap-2">
              <NotificationsMenu onMarkAsRead={onMarkNotificationsAsRead || (() => Promise.resolve())} />
              <UserMenu onLogout={onLogout || (() => Promise.resolve())} />
            </div>
          ) : (
            <Link to="/auth" onClick={onAuthOpen}>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </>
      )}
    </div>
  );
}

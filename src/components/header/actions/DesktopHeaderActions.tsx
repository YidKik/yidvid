
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/header/SearchBar";
import { UserMenu } from "@/components/header/UserMenu";
import { NotificationsMenu } from "@/components/header/NotificationsMenu";
import { useSessionManager } from "@/hooks/useSessionManager";

export function DesktopHeaderActions() {
  const { isAuthenticated, isLoading } = useSessionManager();

  return (
    <div className="hidden md:flex gap-2 items-center">
      <SearchBar />

      {!isLoading && (
        <>
          {isAuthenticated ? (
            <div className="flex gap-2">
              <NotificationsMenu />
              <UserMenu />
            </div>
          ) : (
            <Link to="/auth">
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

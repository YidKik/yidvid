
import { useNavigate } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import { useRef, useState } from "react";

interface UserMenuProps {
  onLogout: () => Promise<void>;
  showSettingsIcon?: boolean;
}

export const UserMenu = ({ onLogout, showSettingsIcon = false }: UserMenuProps) => {
  const { session, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  if (!session || !session.user) return null;

  const user = session.user;
  const displayName = user.email?.split("@")[0] || "User";
  const email = user.email || "";
  // Default avatar fallback (first character)
  const initials = displayName[0]?.toUpperCase() || "U";
  // Render the small avatar for the header/top right
  const avatarUrl = user.user_metadata?.avatar_url || "";

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await onLogout();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {showSettingsIcon ? (
          <button
            ref={buttonRef}
            className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-[#222222] hover:bg-[#333333] text-white transition"
            aria-label="User settings"
            data-testid="user-settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        ) : (
          <button
            ref={buttonRef}
            className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 bg-white flex items-center justify-center transition ring-0 focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="User menu"
            data-testid="user-avatar"
          >
            <Avatar className="h-10 w-10">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" sideOffset={8}>
        <div className="flex flex-col py-3">
          <div className="px-4 py-2 border-b border-muted mb-2">
            <div className="font-bold text-lg leading-tight">{displayName}</div>
            <div className="text-xs text-muted-foreground break-all">{email}</div>
          </div>
          <button
            className="w-full px-4 py-2 text-left hover:bg-muted transition text-base"
            onClick={() => handleNavigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-muted transition text-base"
            onClick={() => handleNavigate("/settings")}
          >
            Settings
          </button>
          <button
            className="mt-1 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition text-base"
            disabled={isLoggingOut}
            onClick={handleSignOut}
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};


import { Button } from "@/components/ui/button"; 
import { LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface AccountActionsProps {
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

export const AccountActions = ({ isLoggingOut, handleLogout }: AccountActionsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex gap-2 mt-1 md:mt-0">
      <Button
        variant="outline"
        size={isMobile ? "sm" : "default"}
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${isMobile ? 'text-xs py-0.5 h-6 px-2' : ''} flex items-center gap-1`}
      >
        <LogOut className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        {isLoggingOut ? (isMobile ? "..." : "Signing out...") : (isMobile ? "Sign out" : "Sign out")}
      </Button>
    </div>
  );
};

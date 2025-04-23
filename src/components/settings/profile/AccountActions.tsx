
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface AccountActionsProps {
  isLoggingOut: boolean;
  handleLogout: () => void;
}

export const AccountActions = ({
  isLoggingOut,
  handleLogout,
}: AccountActionsProps) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className={`flex ${isMobile ? "flex-col gap-2 mt-1.5" : "flex-row gap-4 mt-3"}`}>
      <Button
        onClick={handleDashboard}
        variant="outline"
        className="flex-1 flex items-center justify-center gap-2"
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="font-medium">Dashboard</span>
      </Button>
      <Button
        onClick={handleLogout}
        variant="outline"
        className="flex-1 flex items-center justify-center gap-2"
        disabled={isLoggingOut}
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
      </Button>
    </div>
  );
};

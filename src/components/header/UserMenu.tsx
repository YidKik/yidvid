
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface UserMenuProps {
  onLogout: () => Promise<void>;
}

export const UserMenu = ({ onLogout }: UserMenuProps) => {
  const navigate = useNavigate();
  const { isLoggingOut } = useAuth();

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="h-10 w-10"
      disabled={isLoggingOut}
      onClick={handleSettingsClick}
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
};


import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface UserMenuProps {
  onLogout: () => Promise<void>;
  handleSettingsClick?: () => void;
}

export const UserMenu = ({ onLogout, handleSettingsClick }: UserMenuProps) => {
  const navigate = useNavigate();
  const { isLoggingOut } = useAuth();
  const queryClient = useQueryClient();
  
  const handleSettingsButtonClick = () => {
    if (handleSettingsClick) {
      handleSettingsClick();
    } else {
      navigate("/settings");
    }
  };
  
  const handleFastLogout = async () => {
    // Cancel any in-flight queries immediately 
    queryClient.cancelQueries();
    
    // Trigger logout without toast
    onLogout();
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="h-10 w-10"
      title="Settings"
      onClick={handleSettingsButtonClick}
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
};

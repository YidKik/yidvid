
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UserMenuProps {
  onLogout: () => Promise<void>;
}

export const UserMenu = ({ onLogout }: UserMenuProps) => {
  const navigate = useNavigate();
  const { isLoggingOut } = useAuth();
  const queryClient = useQueryClient();
  
  const handleSettingsClick = () => {
    navigate("/settings");
  };
  
  const handleFastLogout = async () => {
    // Cancel any in-flight queries immediately 
    queryClient.cancelQueries();
    
    // Show immediate feedback
    toast.loading("Signing out...");
    
    // Trigger logout
    onLogout();
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="h-10 w-10"
      title="Settings"
      onClick={handleSettingsClick}
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
};


import { Button } from "@/components/ui/button";
import { LayoutDashboard, Lock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface AdminDashboardAccessProps {
  isAdmin: boolean;
  openPinDialog: () => void;
  isMobile: boolean;
}

export const AdminDashboardAccess = ({ 
  isAdmin, 
  openPinDialog,
  isMobile
}: AdminDashboardAccessProps) => {
  const navigate = useNavigate();
  
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  if (isAdmin) {
    return (
      <Button 
        onClick={handleDashboardClick}
        className={`flex items-center gap-2 ${isMobile ? 'py-1 h-8 text-xs' : ''}`}
        size={isMobile ? "sm" : "default"}
      >
        <LayoutDashboard className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'}`} />
        Dashboard
      </Button>
    );
  }
  
  return (
    <Button 
      onClick={openPinDialog}
      variant="outline"
      className={`flex items-center gap-2 ${isMobile ? 'py-1 h-8 text-xs' : ''}`}
      size={isMobile ? "sm" : "default"}
    >
      <Lock className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'}`} />
      Enter PIN
    </Button>
  );
};


import { Bell, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "../contact/ContactDialog";
import { NotificationsMenu } from "../header/NotificationsMenu";
import { UserMenu } from "../header/UserMenu";
import { Separator } from "../ui/separator";
import { useNavigate } from "react-router-dom";
import { useSessionManager } from "@/hooks/useSessionManager";

interface MobileBottomNavProps {
  onMarkNotificationsAsRead: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const MobileBottomNav = ({
  onMarkNotificationsAsRead,
  onLogout,
}: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSessionManager();

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-100 h-14 px-4 md:hidden z-50 shadow-lg">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto relative">
        {isAuthenticated && (
          <>
            <NotificationsMenu onMarkAsRead={onMarkNotificationsAsRead} />
            <Separator orientation="vertical" className="h-8 bg-gray-200/60" />
          </>
        )}
        
        <Separator orientation="vertical" className="h-8 bg-gray-200/60" />
        
        {isAuthenticated ? (
          <UserMenu onLogout={onLogout} />
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 hover:bg-gray-100/60 rounded-full"
            onClick={handleSettingsClick}
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
};

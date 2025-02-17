
import { Bell, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "../contact/ContactDialog";
import { NotificationsMenu } from "../header/NotificationsMenu";
import { UserMenu } from "../header/UserMenu";
import { Separator } from "../ui/separator";
import { useNavigate } from "react-router-dom";

interface MobileBottomNavProps {
  session: any;
  onMarkNotificationsAsRead: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const MobileBottomNav = ({
  session,
  onMarkNotificationsAsRead,
  onLogout,
}: MobileBottomNavProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-100 h-12 px-2 md:hidden z-50">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto relative">
        {session && (
          <>
            <NotificationsMenu 
              session={session}
              onMarkAsRead={onMarkNotificationsAsRead}
            />
            <Separator orientation="vertical" className="h-6 bg-gray-200/60" />
          </>
        )}
        
        <ContactDialog />
        
        <Separator orientation="vertical" className="h-6 bg-gray-200/60" />
        
        {session ? (
          <UserMenu onLogout={onLogout} />
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 hover:bg-gray-100/60"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
};


import { Bell, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "../contact/ContactDialog";
import { NotificationsMenu } from "../header/NotificationsMenu";
import { UserMenu } from "../header/UserMenu";

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
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-100 h-16 px-4 md:hidden z-50">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {session && (
          <NotificationsMenu 
            session={session}
            onMarkAsRead={onMarkNotificationsAsRead}
          />
        )}
        
        <ContactDialog />
        
        {session ? (
          <UserMenu onLogout={onLogout} />
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
};

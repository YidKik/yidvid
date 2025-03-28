
import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bell, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotificationHeaderProps {
  hasNotifications: boolean;
  onClearAll: () => void;
  onClose?: () => void;
}

export const NotificationHeader = ({ 
  hasNotifications, 
  onClearAll,
  onClose 
}: NotificationHeaderProps) => {
  const { isMobile } = useIsMobile();
  
  return (
    <SheetHeader className={`p-3 sm:p-6 border-b border-[#333333] ${isMobile ? 'sticky top-0 z-10 bg-[#222222]/95 backdrop-blur-sm mt-2' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-white" />
          <SheetTitle className="text-base sm:text-xl text-white">Notifications</SheetTitle>
        </div>
        <div className="flex items-center gap-2">
          {hasNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-[10px] sm:text-xs text-white hover:text-white hover:bg-[#333333] h-7 px-2 rounded-md"
            >
              Clear All
            </Button>
          )}
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 rounded-full bg-[#333333] hover:bg-[#444444] text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </SheetHeader>
  );
};


import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotificationHeaderProps {
  hasNotifications: boolean;
  onClearAll: () => void;
}

export const NotificationHeader = ({ hasNotifications, onClearAll }: NotificationHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SheetHeader className={`p-3 sm:p-6 border-b border-[#333333] ${isMobile ? 'sticky top-0 z-10 bg-[#222222]' : ''}`}>
      <div className="flex items-center justify-between">
        <SheetTitle className="text-base sm:text-xl text-white">Notifications</SheetTitle>
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
        </div>
      </div>
    </SheetHeader>
  );
};


import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface NotificationHeaderProps {
  hasNotifications: boolean;
  onClearAll: () => void;
}

export const NotificationHeader = ({ hasNotifications, onClearAll }: NotificationHeaderProps) => {
  return (
    <SheetHeader className="p-2 sm:p-6 border-b border-[#333333]">
      <div className="flex items-center justify-between">
        <SheetTitle className="text-sm sm:text-xl text-white">Notifications</SheetTitle>
        {hasNotifications && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-[10px] text-white hover:text-white hover:bg-[#333333] h-6 px-2"
          >
            Clear All
          </Button>
        )}
      </div>
    </SheetHeader>
  );
};

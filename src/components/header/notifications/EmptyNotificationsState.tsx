
import { BellOff } from "lucide-react";

export const EmptyNotificationsState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <BellOff className="h-8 w-8 text-muted-foreground mb-2 opacity-60" />
      <p className="text-sm text-muted-foreground">No notifications yet</p>
      <p className="text-xs text-muted-foreground mt-1">
        Subscribe to channels to get notified about new videos
      </p>
    </div>
  );
};

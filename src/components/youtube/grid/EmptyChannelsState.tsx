
import { Youtube } from "lucide-react";

export const EmptyChannelsState = () => {
  return (
    <div className="bg-muted rounded-lg p-6 text-center">
      <Youtube className="w-12 h-12 text-primary mx-auto mb-4" />
      <p className="text-lg font-medium mb-2">No channels available yet</p>
      <p className="text-sm text-muted-foreground mb-4">Channels will appear here once they're added to the system.</p>
      <p className="text-xs text-muted-foreground">You can request a new channel using the button above.</p>
    </div>
  );
};

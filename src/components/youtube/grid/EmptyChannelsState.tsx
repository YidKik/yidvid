
import { Youtube } from "lucide-react";

export const EmptyChannelsState = () => {
  return (
    <div className="bg-[#F5F5F5] rounded-lg p-6 text-center">
      <Youtube className="w-12 h-12 text-primary mx-auto mb-4" />
      <p className="text-lg font-medium mb-2">No channels available yet</p>
      <p className="text-sm text-gray-500 mb-4">Channels will appear here once they're added to the system.</p>
      <p className="text-xs text-gray-400">You can request a new channel using the button above.</p>
    </div>
  );
};

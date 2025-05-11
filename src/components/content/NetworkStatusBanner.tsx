
import React from "react";
import { WifiOff } from "lucide-react";

interface NetworkStatusBannerProps {
  networkOffline: boolean;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ networkOffline }) => {
  if (!networkOffline) return null;
  
  return (
    <div className="bg-amber-50 border-b border-amber-200 p-2">
      <div className="flex items-center justify-center gap-2 text-amber-700 text-sm">
        <WifiOff size={16} />
        <p>You appear to be offline. Some features may be limited.</p>
      </div>
    </div>
  );
};


import React from "react";
import { RefreshContentButton } from "./RefreshContentButton";

interface NetworkErrorAlertProps {
  isNetworkError: boolean;
  fetchAttempts?: number;
  networkOffline: boolean;
  isManualRefreshing: boolean;
  onRefresh: () => void;
}

export const NetworkErrorAlert: React.FC<NetworkErrorAlertProps> = ({
  isNetworkError,
  fetchAttempts = 0,
  networkOffline,
  isManualRefreshing,
  onRefresh
}) => {
  // Only show for network errors or repeated fetch failures
  if ((!isNetworkError && fetchAttempts <= 3) || isManualRefreshing) {
    return null;
  }
  
  return (
    <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
      <h3 className="font-medium text-amber-800">
        {networkOffline 
          ? "You appear to be offline" 
          : "Having trouble loading content?"}
      </h3>
      <p className="text-amber-700 text-sm mb-3">
        {networkOffline
          ? "We're showing cached content while your connection is unavailable."
          : "We're encountering some difficulties refreshing the content."}
      </p>
      <RefreshContentButton 
        onClick={onRefresh} 
        disabled={isManualRefreshing || networkOffline}
        isRefreshing={isManualRefreshing}
      />
    </div>
  );
};

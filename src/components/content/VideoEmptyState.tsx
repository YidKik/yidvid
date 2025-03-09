
import React from "react";
import { AlertCircle } from "lucide-react";
import { RefreshContentButton } from "./RefreshContentButton";

interface VideoEmptyStateProps {
  onRefresh?: () => void;
  isRefreshing: boolean;
  message?: string;
  description?: string;
}

export const VideoEmptyState: React.FC<VideoEmptyStateProps> = ({
  onRefresh,
  isRefreshing,
  message = "No videos available",
  description = "We're getting your videos ready. Please check back later."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {!isRefreshing && onRefresh && (
        <RefreshContentButton onClick={onRefresh} />
      )}
    </div>
  );
};

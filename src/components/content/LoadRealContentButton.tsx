
import React from "react";
import { RefreshContentButton } from "./RefreshContentButton";

interface LoadRealContentButtonProps {
  hasOnlySampleVideos: boolean;
  isRefreshing: boolean;
  onForceRefetch: () => void;
}

export const LoadRealContentButton: React.FC<LoadRealContentButtonProps> = ({
  hasOnlySampleVideos,
  isRefreshing,
  onForceRefetch
}) => {
  if (!hasOnlySampleVideos || isRefreshing) {
    return null;
  }
  
  return (
    <div className="flex justify-center mt-4 md:mt-6 mb-6 md:mb-8">
      <RefreshContentButton 
        onClick={onForceRefetch}
        label="Load Real Content"
      />
    </div>
  );
};

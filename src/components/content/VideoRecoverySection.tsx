
import React from 'react';

interface VideoRecoverySectionProps {
  fetchAttempts: number;
  isRefreshing: boolean;
  onRecoveryRefresh: () => void;
}

export const VideoRecoverySection: React.FC<VideoRecoverySectionProps> = ({
  fetchAttempts,
  isRefreshing,
  onRecoveryRefresh
}) => {
  if (fetchAttempts <= 3 || isRefreshing) {
    return null;
  }
  
  return (
    <div className="my-4 p-4 bg-warning-bg border border-warning/40 rounded-md">
      <h3 className="font-medium text-warning">Having trouble loading content?</h3>
      <p className="text-warning text-sm mb-2">We're encountering some difficulties refreshing the content.</p>
      <button 
        onClick={onRecoveryRefresh} 
        className="text-sm bg-card border border-warning/40 hover:bg-warning-bg text-warning font-medium py-1 px-3 rounded"
      >
        Refresh Content
      </button>
    </div>
  );
};


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
    <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
      <h3 className="font-medium text-amber-800">Having trouble loading content?</h3>
      <p className="text-amber-700 text-sm mb-2">We're encountering some difficulties refreshing the content.</p>
      <button 
        onClick={onRecoveryRefresh} 
        className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-1 px-3 rounded"
      >
        Refresh Content
      </button>
    </div>
  );
};

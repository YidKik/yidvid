
import React from "react";

interface ChannelsErrorProps {
  refetch: () => void;
}

export const ChannelsError: React.FC<ChannelsErrorProps> = ({ refetch }) => {
  return (
    <div className="bg-card text-card-foreground rounded-card shadow p-6 border border-border">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-brand mb-2">Error Loading Channels</h2>
        <p className="text-muted-foreground">There was a problem fetching the channels.</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

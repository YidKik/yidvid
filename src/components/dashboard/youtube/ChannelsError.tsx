
import React from "react";

interface ChannelsErrorProps {
  refetch: () => void;
}

export const ChannelsError: React.FC<ChannelsErrorProps> = ({ refetch }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Channels</h2>
        <p className="text-gray-600">There was a problem fetching the channels.</p>
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

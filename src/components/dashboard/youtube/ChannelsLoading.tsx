
import React from "react";
import { Loader2 } from "lucide-react";

export const ChannelsLoading: React.FC = () => {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">YouTube Channels</h2>
      </div>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
};

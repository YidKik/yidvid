
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChannelListItem } from "./ChannelListItem";
import { ChannelVideosManagement } from "@/components/youtube/ChannelVideosManagement";

interface ChannelsMainViewProps {
  channels: any[];
  isDeleting: boolean;
  selectedChannelId: string | null;
  setSelectedChannelId: (id: string) => void;
  handleDeleteChannel: (id: string) => void;
  setChannelToDelete: (id: string | null) => void;
}

export const ChannelsMainView: React.FC<ChannelsMainViewProps> = ({
  channels,
  isDeleting,
  selectedChannelId,
  setSelectedChannelId,
  handleDeleteChannel,
  setChannelToDelete
}) => {
  return (
    <div className="flex h-[calc(100vh-24rem)]">
      <ScrollArea className="w-1/2 border-r">
        <div className="divide-y">
          {channels.length > 0 ? (
            channels.map((channel) => (
              <ChannelListItem
                key={channel.id}
                channel={channel}
                isDeleting={isDeleting}
                onSelect={setSelectedChannelId}
                onDelete={handleDeleteChannel}
                setChannelToDelete={setChannelToDelete}
              />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No channels found. Try adjusting your search or add a new channel.
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="w-1/2 p-4 overflow-auto">
        {selectedChannelId ? (
          <ChannelVideosManagement channelId={selectedChannelId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a channel to manage its videos
          </div>
        )}
      </div>
    </div>
  );
};

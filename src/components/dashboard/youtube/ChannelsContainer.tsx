
import React from 'react';
import { ChannelsHeader } from "./ChannelsHeader";
import { ChannelsSearch } from "./ChannelsSearch";
import { ChannelsMainView } from "./ChannelsMainView";
import { ChannelsLoading } from "./ChannelsLoading";
import { ChannelsError } from "./ChannelsError";
import { useYouTubeChannels } from "@/hooks/youtube/useYouTubeChannels";

export const ChannelsContainer: React.FC = () => {
  const {
    channels,
    isLoading,
    error,
    refetch,
    isChannelDialogOpen,
    setIsChannelDialogOpen,
    isVideoDialogOpen,
    setIsVideoDialogOpen,
    selectedChannelId,
    setSelectedChannelId,
    searchQuery,
    setSearchQuery,
    videoSearchQuery,
    setVideoSearchQuery,
    isDeleting,
    handleDeleteChannel,
    setChannelToDelete
  } = useYouTubeChannels();

  if (isLoading) {
    return <ChannelsLoading />;
  }

  if (error) {
    return <ChannelsError refetch={refetch} />;
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow max-h-[calc(100vh-12rem)] border border-border">
      <div className="p-6 border-b">
        <ChannelsHeader
          isVideoDialogOpen={isVideoDialogOpen}
          setIsVideoDialogOpen={setIsVideoDialogOpen}
          isChannelDialogOpen={isChannelDialogOpen}
          setIsChannelDialogOpen={setIsChannelDialogOpen}
          refetchChannels={refetch}
        />
        <div className="mt-4">
          <ChannelsSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            videoSearchQuery={videoSearchQuery}
            setVideoSearchQuery={setVideoSearchQuery}
          />
        </div>
      </div>
      <ChannelsMainView
        channels={channels}
        isDeleting={isDeleting}
        selectedChannelId={selectedChannelId}
        setSelectedChannelId={setSelectedChannelId}
        handleDeleteChannel={handleDeleteChannel}
        setChannelToDelete={setChannelToDelete}
      />
    </div>
  );
};

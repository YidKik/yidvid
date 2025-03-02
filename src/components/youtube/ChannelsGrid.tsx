
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { useChannelsGrid, Channel } from "@/hooks/channel/useChannelsGrid";
import { ChannelsGridSkeleton } from "./grid/ChannelsGridSkeleton";
import { EmptyChannelsState } from "./grid/EmptyChannelsState";
import { ChannelCard } from "./grid/ChannelCard";
import { toast } from "sonner";

interface ChannelsGridProps {
  onError?: (error: any) => void;
}

export const ChannelsGrid = ({ onError }: ChannelsGridProps) => {
  const { hiddenChannels } = useHiddenChannels();
  const { 
    fetchChannelsDirectly, 
    manuallyFetchedChannels, 
    isLoading, 
    setIsLoading,
    fetchError,
    fetchAttempts
  } = useChannelsGrid();

  // Fetch channels with improved retry logic
  const { data: channels, error, isLoading: isChannelsLoading, refetch } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: fetchChannelsDirectly,
    retry: 3, // Increase retries to 3
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Failed to load channels",
      suppressToasts: true
    },
  });

  // Immediate fetch on mount
  useEffect(() => {
    console.log("ChannelsGrid mounted, attempting to fetch channels");
    refetch().catch(err => {
      console.error("Error fetching channels on mount:", err);
      if (onError) onError(err);
    });
  }, []);

  // Update loading state based on data
  useEffect(() => {
    if (channels?.length || manuallyFetchedChannels?.length) {
      setIsLoading(false);
    }
  }, [channels, manuallyFetchedChannels]);

  // Ensure we have channels data by using direct query result if React Query fails
  useEffect(() => {
    if (error) {
      console.error("Error in React Query channels fetch:", error);
    }
  }, [error]);

  // Early return for skeleton if really loading and no data is available
  if (isLoading && isChannelsLoading && !manuallyFetchedChannels.length) {
    return <ChannelsGridSkeleton />;
  }

  // Choose the best available data source - prioritize real data
  // First try React Query result, then fall back to direct query result
  const displayChannels = channels || manuallyFetchedChannels || [];
  
  // Log what we're actually rendering
  console.log("Rendering ChannelsGrid with", displayChannels?.length || 0, "channels");
  
  // Filter out hidden channels (but only if we have enough channels)
  const visibleChannels = displayChannels?.length > 4 
    ? displayChannels.filter(channel => !hiddenChannels.has(channel.channel_id)) 
    : displayChannels || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 animate-scaleIn">
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <h2 className="text-base md:text-2xl font-bold text-accent">View All Channels</h2>
        <RequestChannelDialog />
      </div>
      
      {visibleChannels.length === 0 ? (
        <EmptyChannelsState />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {visibleChannels.map((channel, index) => (
            <ChannelCard
              key={channel.id || `channel-${index}`}
              id={channel.id}
              channel_id={channel.channel_id}
              title={channel.title}
              thumbnail_url={channel.thumbnail_url} 
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

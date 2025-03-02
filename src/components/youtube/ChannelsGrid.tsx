
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { useChannelsGrid, Channel } from "@/hooks/channel/useChannelsGrid";
import { ChannelsGridSkeleton } from "./grid/ChannelsGridSkeleton";
import { EmptyChannelsState } from "./grid/EmptyChannelsState";
import { ChannelCard } from "./grid/ChannelCard";

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
    fetchError 
  } = useChannelsGrid();

  // Fetch channels with improved error handling and caching
  const { data: channels, error, isLoading: isChannelsLoading, refetch } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: fetchChannelsDirectly,
    retry: 0, // Don't retry automatically
    staleTime: 0, // Don't cache to always get fresh channels
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Use effect to set loading state and ensure we try fetching right away
  useEffect(() => {
    // Force immediate fetch on mount
    refetch().catch(err => {
      console.error("Error fetching channels on mount:", err);
      
      if (onError) onError(err);
    });
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || isChannelsLoading) {
    return <ChannelsGridSkeleton />;
  }

  // If we have manually fetched channels, use those
  const displayChannels = channels || manuallyFetchedChannels;
  const visibleChannels = displayChannels?.filter(channel => !hiddenChannels.has(channel.channel_id)) || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 animate-scaleIn">
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <h2 className="text-base md:text-2xl font-bold text-accent">View All Channels</h2>
        <RequestChannelDialog />
      </div>
      
      {!visibleChannels || visibleChannels.length === 0 ? (
        <EmptyChannelsState />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {visibleChannels.map((channel, index) => (
            <ChannelCard
              key={channel.id}
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

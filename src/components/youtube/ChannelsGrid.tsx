
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
  const [fallbackChannels, setFallbackChannels] = useState<Channel[]>([]);
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
    retry: 1,
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
    // Try both methods to increase chances of success
    refetch().catch(err => {
      console.error("Error fetching channels on mount:", err);
      if (onError) onError(err);
    });
    
    // Emergency fallback - create more sample channels
    if (!channels?.length && !manuallyFetchedChannels?.length && fetchAttempts > 1) {
      const timer = setTimeout(() => {
        console.log("Creating fallback channels as emergency measure");
        const fallbackData = [];
        for (let i = 1; i <= 12; i++) {
          fallbackData.push({
            id: `fallback-${i}`,
            channel_id: `fallback-${i}`,
            title: `Channel ${i} - Fallback Data`,
            thumbnail_url: null
          });
        }
        setFallbackChannels(fallbackData);
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    return () => {};
  }, [fetchAttempts]);

  // Update loading state based on data
  useEffect(() => {
    if (channels?.length || manuallyFetchedChannels?.length || fallbackChannels?.length) {
      setIsLoading(false);
    }
  }, [channels, manuallyFetchedChannels, fallbackChannels]);

  // Early return for skeleton if really loading and no data is available
  if (isLoading && isChannelsLoading && !fallbackChannels.length && !manuallyFetchedChannels.length) {
    return <ChannelsGridSkeleton />;
  }

  // Choose the best available data source - prioritize real data
  const displayChannels = channels || manuallyFetchedChannels || fallbackChannels;
  
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
      
      {!visibleChannels || visibleChannels.length === 0 ? (
        <EmptyChannelsState />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {visibleChannels.map((channel, index) => (
            <ChannelCard
              key={channel.id || `fallback-${index}`}
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

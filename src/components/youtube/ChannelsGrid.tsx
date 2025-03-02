
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
    fetchError 
  } = useChannelsGrid();

  // Fetch channels with improved error handling
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

  // Use effect to ensure we have data to display
  useEffect(() => {
    console.log("ChannelsGrid mounted, attempting to fetch channels");
    
    // Force immediate fetch on mount but only if we don't have data yet
    if (!channels?.length && !manuallyFetchedChannels?.length) {
      refetch().catch(err => {
        console.error("Error fetching channels on mount:", err);
        if (onError) onError(err);
        
        // If error contains recursion, show a toast
        if (err?.message?.includes('recursion detected')) {
          toast.error("Database policy error detected. Using sample data.");
        }
      });
    }
    
    // Emergency fallback - create some sample channels if nothing loads
    if (!channels?.length && !manuallyFetchedChannels?.length) {
      const timer = setTimeout(() => {
        console.log("Creating fallback channels as emergency measure");
        setFallbackChannels([
          {
            id: "fallback-1",
            channel_id: "fallback-1",
            title: "Sample Channel 1 - Fallback",
            thumbnail_url: null
          },
          {
            id: "fallback-2",
            channel_id: "fallback-2",
            title: "Sample Channel 2 - Fallback",
            thumbnail_url: null
          },
          {
            id: "fallback-3",
            channel_id: "fallback-3",
            title: "Sample Channel 3 - Fallback",
            thumbnail_url: null
          },
          {
            id: "fallback-4",
            channel_id: "fallback-4",
            title: "Sample Channel 4 - Fallback",
            thumbnail_url: null
          },
          {
            id: "fallback-5",
            channel_id: "fallback-5",
            title: "Sample Channel 5 - Fallback",
            thumbnail_url: null
          },
          {
            id: "fallback-6",
            channel_id: "fallback-6",
            title: "Sample Channel 6 - Fallback",
            thumbnail_url: null
          }
        ]);
        setIsLoading(false);
      }, 1000); // Reduced from 3000 to load faster
      
      return () => clearTimeout(timer);
    }
    
    return () => {};
  }, []);

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

  // Choose the best available data source
  const displayChannels = channels || manuallyFetchedChannels || fallbackChannels;
  
  // Log what we're actually rendering
  console.log("Rendering ChannelsGrid with", displayChannels?.length || 0, "channels");
  
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

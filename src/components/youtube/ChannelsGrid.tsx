
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { useChannelsGrid, Channel } from "@/hooks/channel/useChannelsGrid";
import { ChannelsGridSkeleton } from "./grid/ChannelsGridSkeleton";
import { EmptyChannelsState } from "./grid/EmptyChannelsState";
import { ChannelCard } from "./grid/ChannelCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Try to fetch directly from database first for faster loading
  const fetchChannelsFromDB = async () => {
    try {
      console.log("Direct database fetch for channels...");
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .is("deleted_at", null)
        .limit(50);
        
      if (error) {
        console.error("Direct DB fetch error:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} channels directly from DB`);
        return data;
      }
      
      return null;
    } catch (err) {
      console.error("Error in direct DB fetch:", err);
      return null;
    }
  };

  // Fetch channels with improved retry logic
  const { data: channels, error, isLoading: isChannelsLoading, refetch } = useQuery({
    queryKey: ["youtube_channels"],
    queryFn: async () => {
      const dbChannels = await fetchChannelsFromDB();
      if (dbChannels && dbChannels.length > 0) {
        return dbChannels;
      }
      return fetchChannelsDirectly();
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

  // Early return for skeleton if really loading and no data is available
  if (isLoading && isChannelsLoading && !manuallyFetchedChannels.length) {
    return <ChannelsGridSkeleton />;
  }

  // Choose the best available data source - prioritize real data
  const hasRealData = channels?.some(c => 
    c.title && !c.title.includes("Sample Channel") && 
    !c.channel_id?.includes("sample")
  );
  
  const hasManualRealData = manuallyFetchedChannels?.some(c => 
    c.title && !c.title.includes("Sample Channel") && 
    !c.channel_id?.includes("sample")
  );
  
  // Use the best data available
  let displayChannels: Channel[] = [];
  
  if (hasRealData && channels?.length) {
    displayChannels = channels;
    console.log("Using real channels data from query:", channels.length);
  } else if (hasManualRealData && manuallyFetchedChannels?.length) {
    displayChannels = manuallyFetchedChannels;
    console.log("Using manually fetched real channels data:", manuallyFetchedChannels.length);
  } else if (channels?.length) {
    displayChannels = channels;
    console.log("Using query channels data (might be sample):", channels.length);
  } else if (manuallyFetchedChannels?.length) {
    displayChannels = manuallyFetchedChannels;
    console.log("Using manually fetched channels data (might be sample):", manuallyFetchedChannels.length);
  } else {
    // Create sample data as last resort
    console.log("Creating sample channels as fallback");
    displayChannels = Array(8).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      channel_id: `sample-channel-${i}`,
      title: `Sample Channel ${i+1}`,
      thumbnail_url: null
    }));
  }
  
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

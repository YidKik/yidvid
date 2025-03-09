
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Channel, useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
import { useSampleChannels } from "@/hooks/channel/useSampleChannels";

interface ChannelDataProviderProps {
  children: (data: {
    displayChannels: Channel[];
    isLoading: boolean;
  }) => React.ReactNode;
  onError?: (error: any) => void;
}

export const ChannelDataProvider = ({ children, onError }: ChannelDataProviderProps) => {
  const { 
    fetchChannelsDirectly, 
    manuallyFetchedChannels, 
    isLoading, 
    setIsLoading,
    fetchError
  } = useChannelsGrid();
  
  const { createSampleChannels, hasRealChannels } = useSampleChannels();
  const [displayChannels, setDisplayChannels] = useState<Channel[]>([]);

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
      
      // Fall back to the manual fetch function
      const manualData = await fetchChannelsDirectly();
      if (manualData && manualData.length > 0) {
        return manualData;
      }
      
      // If all else fails, try one more direct query with minimal fields
      try {
        const lastAttempt = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .limit(30);
          
        if (!lastAttempt.error && lastAttempt.data?.length > 0) {
          return lastAttempt.data;
        }
      } catch (e) {
        console.error("Final attempt also failed:", e);
      }
      
      // If we get here, we need sample data
      return createSampleChannels();
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

  // Effect for immediate fetch on mount
  useEffect(() => {
    console.log("ChannelDataProvider mounted, attempting to fetch channels");
    refetch().catch(err => {
      console.error("Error fetching channels on mount:", err);
      if (onError) onError(err);
    });
  }, [refetch, onError]);

  // Update loading state based on data
  useEffect(() => {
    if (channels?.length || manuallyFetchedChannels?.length) {
      setIsLoading(false);
    }
  }, [channels, manuallyFetchedChannels, setIsLoading]);

  // Find the best data source to display
  useEffect(() => {
    let bestChannels: Channel[] = [];
    
    if (hasRealChannels(channels)) {
      console.log("Using real channels data from react-query cache");
      bestChannels = channels || [];
    } else if (hasRealChannels(manuallyFetchedChannels)) {
      console.log("Using real channels data from manual fetch");
      bestChannels = manuallyFetchedChannels;
    } else if (channels?.length) {
      bestChannels = channels;
    } else if (manuallyFetchedChannels?.length) {
      bestChannels = manuallyFetchedChannels;
    } else {
      // Use sample channels as fallback
      bestChannels = createSampleChannels();
    }
    
    setDisplayChannels(bestChannels);
  }, [channels, manuallyFetchedChannels, hasRealChannels, createSampleChannels]);

  return (
    <>
      {children({
        displayChannels,
        isLoading: isLoading && isChannelsLoading && !manuallyFetchedChannels.length
      })}
    </>
  );
};

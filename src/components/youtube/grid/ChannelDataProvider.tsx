
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
  const [lastAuthEvent, setLastAuthEvent] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in ChannelDataProvider:", event);
      setLastAuthEvent(event);
      
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log("Auth event triggered refetch of channels");
        setIsLoading(true);
        
        // Use setTimeout to avoid recursion issues with Supabase RLS
        setTimeout(() => {
          refetch().catch(error => {
            console.error("Error refetching channels after auth change:", error);
          });
        }, 200);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
        
        const simplifiedQuery = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .limit(50);
          
        if (!simplifiedQuery.error && simplifiedQuery.data?.length > 0) {
          return simplifiedQuery.data;
        }
        
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

  const { data: channels, error, isLoading: isChannelsLoading, refetch } = useQuery({
    queryKey: ["youtube_channels", lastAuthEvent],
    queryFn: async () => {
      const dbChannels = await fetchChannelsFromDB();
      if (dbChannels && dbChannels.length > 0) {
        return dbChannels;
      }
      
      const manualData = await fetchChannelsDirectly();
      if (manualData && manualData.length > 0) {
        return manualData;
      }
      
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

  useEffect(() => {
    console.log("ChannelDataProvider mounted, attempting to fetch channels");
    refetch().catch(err => {
      console.error("Error fetching channels on mount:", err);
      if (onError) onError(err);
    });
  }, [refetch, error]);

  useEffect(() => {
    if (channels?.length || manuallyFetchedChannels?.length) {
      setIsLoading(false);
    }
  }, [channels, manuallyFetchedChannels, setIsLoading]);

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

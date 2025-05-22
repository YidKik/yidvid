
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
  searchQuery?: string;
}

export const ChannelDataProvider = ({ children, onError, searchQuery = "" }: ChannelDataProviderProps) => {
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
      
      // Use the edge function to fetch public channels
      try {
        console.log("Trying edge function to fetch ALL channels...");
        const urlWithSearch = `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
        console.log("Fetching from URL:", urlWithSearch);
        
        const response = await fetch(urlWithSearch, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            console.log(`Retrieved ${result.data.length} channels with edge function`);
            return result.data;
          }
        }
      } catch (edgeError) {
        console.error("Edge function error:", edgeError);
      }
      
      // Fall back to direct query with no limit
      let query = supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url, description")
        .is("deleted_at", null);
        
      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error("Direct DB fetch error:", error);
        
        // Try a different approach with minimal fields and no limit
        let simplifiedQuery = supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url");
          
        if (searchQuery) {
          simplifiedQuery = simplifiedQuery.ilike("title", `%${searchQuery}%`);
        }
          
        const simplifiedResult = await simplifiedQuery;
          
        if (!simplifiedResult.error && simplifiedResult.data?.length > 0) {
          return simplifiedResult.data;
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
    queryKey: ["youtube_channels", lastAuthEvent, searchQuery],
    queryFn: async () => {
      // Try edge function first for best public access
      try {
        console.log("Fetching ALL public channels via edge function...");
        const urlWithSearch = `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
        const response = await fetch(urlWithSearch, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            console.log(`Retrieved ${result.data.length} channels with edge function`);
            return result.data;
          }
        }
      } catch (edgeError) {
        console.error("Edge function error:", edgeError);
      }
      
      // Then try direct database fetch
      const dbChannels = await fetchChannelsFromDB();
      if (dbChannels && dbChannels.length > 0) {
        return dbChannels;
      }
      
      // Then try manual fetch method with no limit
      const manualData = await fetchChannelsDirectly();
      if (manualData && manualData.length > 0) {
        return manualData;
      }
      
      // Last resort, use sample data
      const sampleChannels = createSampleChannels();
      if (searchQuery) {
        return sampleChannels.filter(channel => 
          channel.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return sampleChannels;
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
    console.log("ChannelDataProvider mounted or searchQuery changed:", searchQuery);
    refetch().catch(err => {
      console.error("Error fetching channels on mount/search change:", err);
      if (onError) onError(err);
    });
  }, [refetch, error, searchQuery]);

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
      const sampleChannels = createSampleChannels();
      if (searchQuery) {
        bestChannels = sampleChannels.filter(channel => 
          channel.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        bestChannels = sampleChannels;
      }
    }
    
    setDisplayChannels(bestChannels);
  }, [channels, manuallyFetchedChannels, hasRealChannels, createSampleChannels, searchQuery]);

  return (
    <>
      {children({
        displayChannels,
        isLoading: isLoading && isChannelsLoading && !manuallyFetchedChannels.length
      })}
    </>
  );
};

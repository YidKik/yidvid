
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
            // Use Supabase client instead of direct fetch
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

  // Memoized query function to prevent unnecessary re-renders
  const queryFn = async () => {
    // Try edge function first for best public access
    try {
      console.log("Fetching channels via edge function...");
      const urlWithSearch = `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
      const response = await fetch(urlWithSearch, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          // Sort channels by title for consistent ordering
          const sortedChannels = result.data.sort((a: Channel, b: Channel) => 
            (a.title || '').localeCompare(b.title || '')
          );
          console.log(`Retrieved ${sortedChannels.length} channels with edge function`);
          return sortedChannels;
        }
      }
    } catch (edgeError) {
      console.error("Edge function error:", edgeError);
    }
    
    // Then try direct database fetch
    const dbChannels = await fetchChannelsFromDB();
    if (dbChannels && dbChannels.length > 0) {
      // Sort for consistent ordering
      return dbChannels.sort((a: Channel, b: Channel) => 
        (a.title || '').localeCompare(b.title || '')
      );
    }
    
    // Then try manual fetch method
    const manualData = await fetchChannelsDirectly();
    if (manualData && manualData.length > 0) {
      return manualData.sort((a: Channel, b: Channel) => 
        (a.title || '').localeCompare(b.title || '')
      );
    }
    
    // Last resort, use sample data
    const sampleChannels = createSampleChannels();
    const filteredSamples = searchQuery 
      ? sampleChannels.filter(channel => 
          channel.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : sampleChannels;
      
    return filteredSamples.sort((a: Channel, b: Channel) => 
      (a.title || '').localeCompare(b.title || '')
    );
  };

  const { data: channels, error, isLoading: isChannelsLoading, refetch } = useQuery({
    queryKey: ["youtube_channels", searchQuery],
    queryFn,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false, // Prevent unnecessary refetches
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Failed to load channels",
      suppressToasts: true
    },
  });

  // Single useEffect to handle data changes and prevent race conditions
  useEffect(() => {
    let finalChannels: Channel[] = [];
    
    if (channels && channels.length > 0) {
      if (hasRealChannels(channels)) {
        console.log(`Using ${channels.length} real channels from react-query`);
        finalChannels = channels;
      } else {
        console.log(`Using ${channels.length} sample channels from react-query`);
        finalChannels = channels;
      }
    } else if (manuallyFetchedChannels && manuallyFetchedChannels.length > 0) {
      if (hasRealChannels(manuallyFetchedChannels)) {
        console.log(`Using ${manuallyFetchedChannels.length} real channels from manual fetch`);
        finalChannels = manuallyFetchedChannels.sort((a: Channel, b: Channel) => 
          (a.title || '').localeCompare(b.title || '')
        );
      } else {
        finalChannels = manuallyFetchedChannels;
      }
    } else {
      // Fallback to sample channels
      const sampleChannels = createSampleChannels();
      finalChannels = searchQuery 
        ? sampleChannels.filter(channel => 
            channel.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : sampleChannels;
    }
    
    // Only update if the channels have actually changed
    setDisplayChannels(prev => {
      if (prev.length !== finalChannels.length) {
        return finalChannels;
      }
      // Check if content is different
      const isDifferent = prev.some((channel, index) => 
        channel.id !== finalChannels[index]?.id
      );
      return isDifferent ? finalChannels : prev;
    });
    
    setIsLoading(false);
  }, [channels, manuallyFetchedChannels, hasRealChannels, createSampleChannels, searchQuery, setIsLoading]);

  return (
    <>
      {children({
        displayChannels,
        isLoading: isLoading && isChannelsLoading && !manuallyFetchedChannels.length
      })}
    </>
  );
};

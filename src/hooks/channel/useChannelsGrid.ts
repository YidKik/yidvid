
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom" | null;
  fetch_error?: string | null;
  last_fetch?: string | null;
}

export const useChannelsGrid = () => {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side filtering - instant, no refetch needed
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) {
      return allChannels;
    }
    const query = searchQuery.toLowerCase().trim();
    return allChannels.filter(channel => 
      channel.title.toLowerCase().includes(query)
    );
  }, [allChannels, searchQuery]);

  const fetchChannelsDirectly = async (): Promise<Channel[]> => {
    try {
      console.log("Fetching ALL channels directly...");
      
      // Direct database query - only get non-deleted channels
      const { data: channelsData, error: channelsError } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url, description, created_at, updated_at, deleted_at, default_category, fetch_error, last_fetch")
        .is("deleted_at", null)
        .order("title", { ascending: true });
        
      if (!channelsError && channelsData && channelsData.length > 0) {
        console.log(`Successfully fetched ${channelsData.length} channels`);
        return channelsData;
      }
      
      if (channelsError) {
        console.warn("Direct DB fetch error:", channelsError);
      }
      
      // Try edge function as fallback
      try {
        const response = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
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
      
      return [];
    } catch (err) {
      console.error("Error in fetchChannelsDirectly:", err);
      throw err;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initialFetchChannels = async () => {
      try {
        setIsLoading(true);
        const channels = await fetchChannelsDirectly();
        if (isMounted) {
          setAllChannels(channels);
          setFetchError(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error in initialFetchChannels:", error);
          setFetchError(error instanceof Error ? error : new Error(String(error)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initialFetchChannels();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    fetchChannelsDirectly,
    manuallyFetchedChannels: filteredChannels,
    allChannels,
    isLoading,
    setIsLoading,
    fetchError,
    searchQuery,
    setSearchQuery // Now just updates state, filtering is done via useMemo
  };
};

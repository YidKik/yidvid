
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [manuallyFetchedChannels, setManuallyFetchedChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChannelsDirectly = async (searchTerm: string = ""): Promise<Channel[]> => {
    try {
      setIsLoading(true);
      console.log("Attempting to fetch channels directly with search:", searchTerm);
      
      // First try with edge function which supports search
      try {
        const urlWithSearch = `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`;
        console.log("Fetching from edge function:", urlWithSearch);
        
        const response = await fetch(urlWithSearch, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            console.log(`Retrieved ${result.data.length} channels with edge function`);
            setManuallyFetchedChannels(result.data);
            setFetchError(null);
            return result.data;
          }
        }
      } catch (edgeError) {
        console.error("Edge function error:", edgeError);
      }
      
      // Fall back to regular database query
      let query = supabase.from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url, description, created_at, updated_at, deleted_at, default_category, fetch_error, last_fetch")
        .is("deleted_at", null);
        
      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }
      
      const { data: channelsData, error: channelsError } = await query.limit(100);
      
      if (!channelsError && channelsData && channelsData.length > 0) {
        console.log(`Successfully fetched ${channelsData.length} channels directly`);
        setManuallyFetchedChannels(channelsData);
        setFetchError(null);
        return channelsData;
      }
      
      if (channelsError) {
        console.warn("Direct DB fetch error:", channelsError);
        
        // Try fallback with simplified query
        let simplifiedQuery = supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url, description, created_at, updated_at");
          
        if (searchTerm) {
          simplifiedQuery = simplifiedQuery.ilike("title", `%${searchTerm}%`);
        }
        
        const { data: simplifiedData, error: simplifiedError } = await simplifiedQuery.limit(50);
        
        if (!simplifiedError && simplifiedData && simplifiedData.length > 0) {
          console.log(`Retrieved ${simplifiedData.length} channels with simplified query`);
          setManuallyFetchedChannels(simplifiedData);
          setFetchError(null);
          return simplifiedData;
        }
      }
      
      console.error("All channel fetch methods failed");
      setFetchError(new Error("Failed to fetch channels"));
      return [];
    } catch (err) {
      console.error("Error in fetchChannelsDirectly:", err);
      setFetchError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Update search handler
  const handleSearchChange = async (newQuery: string) => {
    setSearchQuery(newQuery);
    await fetchChannelsDirectly(newQuery);
  };

  useEffect(() => {
    let isMounted = true;
    
    const initialFetchChannels = async () => {
      try {
        const channels = await fetchChannelsDirectly();
        if (isMounted) {
          setManuallyFetchedChannels(channels);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error in initialFetchChannels:", error);
          setFetchError(error instanceof Error ? error : new Error(String(error)));
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
    manuallyFetchedChannels,
    isLoading,
    setIsLoading,
    fetchError,
    searchQuery,
    setSearchQuery: handleSearchChange
  };
};

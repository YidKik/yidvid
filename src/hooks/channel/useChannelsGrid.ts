
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url?: string | null;
}

export const useChannelsGrid = () => {
  const [manuallyFetchedChannels, setManuallyFetchedChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  const fetchChannelsDirectly = async (): Promise<Channel[]> => {
    try {
      console.log("Attempting to fetch channels directly...");
      
      // First try regular database query (may fail due to RLS)
      const { data: channelsData, error: channelsError } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .is("deleted_at", null)
        .limit(100);
        
      if (!channelsError && channelsData && channelsData.length > 0) {
        console.log(`Successfully fetched ${channelsData.length} channels directly`);
        setManuallyFetchedChannels(channelsData);
        setIsLoading(false);
        return channelsData;
      }
      
      if (channelsError) {
        console.warn("Direct DB fetch error:", channelsError);
        
        // Try fallback with edge function to bypass RLS
        try {
          console.log("Trying edge function to fetch channels...");
          const response = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels", {
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
              setIsLoading(false);
              return result.data;
            }
          } else {
            console.warn("Edge function call failed:", response.statusText);
          }
        } catch (edgeError) {
          console.error("Edge function error:", edgeError);
        }
      }
      
      // Final fallback - try simplified query
      const { data: simplifiedData, error: simplifiedError } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .limit(50);
        
      if (!simplifiedError && simplifiedData && simplifiedData.length > 0) {
        console.log(`Retrieved ${simplifiedData.length} channels with simplified query`);
        setManuallyFetchedChannels(simplifiedData);
        setIsLoading(false);
        return simplifiedData;
      }
      
      console.error("All channel fetch methods failed");
      setFetchError(new Error("Failed to fetch channels"));
      setIsLoading(false);
      return [];
    } catch (err) {
      console.error("Error in fetchChannelsDirectly:", err);
      setFetchError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return [];
    }
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
    fetchError
  };
};

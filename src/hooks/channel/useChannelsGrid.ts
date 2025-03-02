
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url: string | null;
}

export const useChannelsGrid = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [manuallyFetchedChannels, setManuallyFetchedChannels] = useState<Channel[]>([]);
  const [fetchError, setFetchError] = useState<any>(null);

  const fetchChannelsDirectly = async (): Promise<Channel[]> => {
    try {
      console.log("Fetching YouTube channels");
      
      // Try a simple query first
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .order("title", { ascending: true });

      if (error) {
        console.error("Channel fetch error:", error);
        setFetchError(error);
        
        // Try a fallback approach immediately
        await manualFetchChannels();
        return manuallyFetchedChannels;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} channels`);
      
      // If we got channels, update our state
      if (data && data.length > 0) {
        setManuallyFetchedChannels(data);
      }
      
      return data || [];
    } catch (error: any) {
      console.error("Channel fetch error:", error);
      // Try fallback method
      await manualFetchChannels();
      return manuallyFetchedChannels;
    } finally {
      setIsLoading(false);
    }
  };

  // Backup method to fetch channels directly
  const manualFetchChannels = async () => {
    try {
      console.log("Attempting manual channel fetch as backup");
      
      // Try a simpler query with fewer constraints
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .limit(100); // Limit to 100 channels to avoid overload
        
      if (error) {
        console.error("Manual channel fetch also failed:", error);
        setFetchError(error);
      } else {
        console.log(`Successfully fetched ${data?.length || 0} channels via backup method`);
        setManuallyFetchedChannels(data || []);
      }
    } catch (err) {
      console.error("Unexpected error in manual fetch:", err);
      setFetchError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Try to fetch channels once on component mount
  useEffect(() => {
    const fetchOnMount = async () => {
      try {
        await fetchChannelsDirectly();
      } catch (error) {
        console.error("Failed to fetch channels on mount:", error);
      }
    };
    
    fetchOnMount();
  }, []);

  return {
    fetchChannelsDirectly,
    manualFetchChannels,
    manuallyFetchedChannels,
    isLoading,
    setIsLoading,
    fetchError
  };
};


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
  const [fetchAttempts, setFetchAttempts] = useState(0);

  const fetchChannelsDirectly = async (): Promise<Channel[]> => {
    try {
      console.log("Fetching YouTube channels (attempt " + (fetchAttempts + 1) + ")");
      setFetchAttempts(prev => prev + 1);
      
      // Explicitly exclude deleted channels
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .is("deleted_at", null)
        .limit(50);

      if (error) {
        console.error("Channel fetch error:", error);
        setFetchError(error);
        return [];
      }
      
      console.log(`Successfully fetched ${data?.length || 0} channels`);
      
      // If we got channels, update our state
      if (data && data.length > 0) {
        setManuallyFetchedChannels(data);
        setIsLoading(false);
        return data;
      }
      
      // If no data was returned, return empty array
      return [];
    } catch (error: any) {
      console.error("Channel fetch error:", error);
      return [];
    }
  };

  // Try to fetch channels once on component mount
  useEffect(() => {
    fetchChannelsDirectly().catch(() => {
      console.error("Failed to fetch channels");
    });
  }, []);

  return {
    fetchChannelsDirectly,
    manuallyFetchedChannels,
    isLoading,
    setIsLoading,
    fetchError,
    fetchAttempts
  };
};

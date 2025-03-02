
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
      
      // Try a simplified query to avoid RLS policy issues
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .limit(20); // Limit to 20 channels to avoid policy recursion

      if (error) {
        console.error("Channel fetch error:", error);
        setFetchError(error);
        
        // Return sample channels immediately for any error
        return getSampleChannels();
      }
      
      console.log(`Successfully fetched ${data?.length || 0} channels`);
      
      // If we got channels, update our state
      if (data && data.length > 0) {
        setManuallyFetchedChannels(data);
        return data;
      }
      
      // If no data was returned, return sample channels
      return getSampleChannels();
    } catch (error: any) {
      console.error("Channel fetch error:", error);
      return getSampleChannels();
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified backup method to fetch channels directly
  const manualFetchChannels = async () => {
    // No need for this when we immediately return sample data on error
    setIsLoading(false);
  };

  // Generate sample channels
  const getSampleChannels = (): Channel[] => {
    console.log("Using sample channels as fallback");
    const sampleChannels = [
      {
        id: "sample-1",
        channel_id: "sample-channel-1",
        title: "Sample Channel 1 - DB Error",
        thumbnail_url: null
      },
      {
        id: "sample-2",
        channel_id: "sample-channel-2",
        title: "Sample Channel 2 - DB Error",
        thumbnail_url: null
      },
      {
        id: "sample-3",
        channel_id: "sample-channel-3",
        title: "Sample Channel 3 - DB Error",
        thumbnail_url: null
      },
      {
        id: "sample-4",
        channel_id: "sample-channel-4",
        title: "Sample Channel 4 - DB Error",
        thumbnail_url: null
      },
      {
        id: "sample-5",
        channel_id: "sample-channel-5",
        title: "Sample Channel 5 - DB Error",
        thumbnail_url: null
      },
      {
        id: "sample-6",
        channel_id: "sample-channel-6",
        title: "Sample Channel 6 - DB Error",
        thumbnail_url: null
      }
    ];
    
    setManuallyFetchedChannels(sampleChannels);
    return sampleChannels;
  };

  // Try to fetch channels once on component mount
  useEffect(() => {
    fetchChannelsDirectly().catch(console.error);
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

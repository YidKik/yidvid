
import { useState } from 'react';
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
      
      // Only select necessary fields to avoid potential recursion issues
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .is("deleted_at", null)
        .order("title", { ascending: true });

      if (error) {
        console.error("Channel fetch error:", error);
        setFetchError(error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} channels`);
      return data || [];
    } catch (error: any) {
      console.error("Channel fetch error:", error);
      await manualFetchChannels();
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Backup method to fetch channels directly
  const manualFetchChannels = async () => {
    try {
      console.log("Attempting manual channel fetch as backup");
      
      // Using a more direct approach with minimal fields
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .is("deleted_at", null)
        .limit(100); // Limit to 100 channels to avoid overload
        
      if (error) {
        console.error("Manual channel fetch also failed:", error);
        setFetchError(error);
        toast.error("Failed to load channels. Please try again later.");
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

  return {
    fetchChannelsDirectly,
    manualFetchChannels,
    manuallyFetchedChannels,
    isLoading,
    setIsLoading,
    fetchError
  };
};


import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionContext";

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
  const { session } = useSession();

  const fetchChannelsDirectly = async (): Promise<Channel[]> => {
    try {
      console.log("Fetching YouTube channels directly (attempt " + (fetchAttempts + 1) + ")");
      setFetchAttempts(prev => prev + 1);
      
      // Get the user's session - important to check auth state
      const sessionStatus = await supabase.auth.getSession();
      const isAuthenticated = !!sessionStatus.data.session;
      console.log(`User authentication status: ${isAuthenticated ? 'LOGGED IN' : 'NOT LOGGED IN'}`);
      
      // Try to fetch channels with thumbnail URL first
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url, description")
        .is("deleted_at", null)
        .limit(50);

      if (error) {
        console.error("Channel fetch error:", error);
        setFetchError(error);
        
        // Try without the deleted_at filter which might cause RLS issues
        const simpleQuery = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url, description")
          .limit(50);
          
        if (!simpleQuery.error && simpleQuery.data && simpleQuery.data.length > 0) {
          console.log(`Recovered with simple query: ${simpleQuery.data.length} channels`);
          setManuallyFetchedChannels(simpleQuery.data);
          setIsLoading(false);
          return simpleQuery.data;
        }
        
        // Try with a more minimal query as last resort
        const minimalQuery = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .limit(30);
          
        if (!minimalQuery.error && minimalQuery.data && minimalQuery.data.length > 0) {
          console.log(`Retrieved ${minimalQuery.data.length} channels with minimal data`);
          setManuallyFetchedChannels(minimalQuery.data);
          setIsLoading(false);
          return minimalQuery.data;
        }
        
        // Only use sample data as final fallback
        const sampleChannels: Channel[] = createSampleChannels();
        setManuallyFetchedChannels(sampleChannels);
        setIsLoading(false);
        return sampleChannels;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} channels`);
      
      if (data && data.length > 0) {
        setManuallyFetchedChannels(data);
        setIsLoading(false);
        return data;
      }
      
      // Try another approach if first query returned empty
      const backupQuery = await supabase
        .from("youtube_channels")
        .select("*")
        .limit(50);
        
      if (!backupQuery.error && backupQuery.data && backupQuery.data.length > 0) {
        console.log(`Retrieved ${backupQuery.data.length} channels with backup query`);
        setManuallyFetchedChannels(backupQuery.data);
        setIsLoading(false);
        return backupQuery.data;
      }
      
      // Last resort: sample data
      const sampleChannels: Channel[] = createSampleChannels();
      setManuallyFetchedChannels(sampleChannels);
      setIsLoading(false);
      return sampleChannels;
    } catch (error: any) {
      console.error("Channel fetch error:", error);
      
      // Final attempt with a different approach
      try {
        const finalAttempt = await supabase
          .from("youtube_channels")
          .select("*")
          .limit(30);
          
        if (!finalAttempt.error && finalAttempt.data?.length > 0) {
          console.log(`Final attempt retrieved ${finalAttempt.data.length} channels`);
          setManuallyFetchedChannels(finalAttempt.data);
          setIsLoading(false);
          return finalAttempt.data;
        }
      } catch (e) {
        console.error("Final channel attempt also failed:", e);
      }
      
      // Last resort: sample data
      const sampleChannels: Channel[] = createSampleChannels();
      setManuallyFetchedChannels(sampleChannels);
      setIsLoading(false);
      return sampleChannels;
    }
  };
  
  // Create sample channels as a fallback - only used when all else fails
  const createSampleChannels = (): Channel[] => {
    return Array(8).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      channel_id: `sample-channel-${i}`,
      title: `Sample Channel ${i+1}`,
      thumbnail_url: null
    }));
  };

  useEffect(() => {
    console.log("useChannelsGrid mounted, fetching channels with auth status:", !!session);
    fetchChannelsDirectly().catch(() => {
      console.error("Failed to fetch channels on mount");
    });
  }, [session]);

  return {
    fetchChannelsDirectly,
    manuallyFetchedChannels,
    isLoading,
    setIsLoading,
    fetchError,
    fetchAttempts
  };
};

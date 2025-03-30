
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useChannelData = (channelId: string | undefined) => {
  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      // First try the most complete query
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .eq("channel_id", channelId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching channel:", error);
          throw error;
        }

        if (!data) {
          console.warn("Channel not found for ID:", channelId);
          throw new Error("Channel not found");
        }

        return data;
      } catch (primaryError) {
        console.warn("Primary channel fetch failed, trying backup method...");
        
        // Try a simplified query for public data access
        try {
          const { data: basicData, error: basicError } = await supabase
            .from("youtube_channels")
            .select("channel_id, title, thumbnail_url, description")
            .eq("channel_id", channelId)
            .maybeSingle();
            
          if (!basicError && basicData) {
            console.log("Retrieved basic channel data as fallback");
            return basicData;
          }
        } catch (backupError) {
          console.error("Backup channel fetch also failed:", backupError);
        }
        
        // Re-throw the original error if all attempts fail
        throw primaryError;
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    meta: {
      suppressToasts: true
    }
  });
};

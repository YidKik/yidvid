
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getChannelById } from "@/utils/youtube-channel";
import { toast } from "sonner";

export const useChannelData = (channelId: string | undefined) => {
  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      // Validate channel ID more carefully
      if (!channelId || channelId.trim() === "") {
        console.error("Empty or undefined channel ID provided to useChannelData");
        throw new Error("Channel ID is required");
      }
      
      // Clean the channelId to remove any unwanted characters
      const cleanedChannelId = channelId.trim();
      
      console.log("useChannelData querying for channel:", cleanedChannelId);

      try {
        // First attempt: Try to get channel using our enhanced lookup function
        const channelData = await getChannelById(cleanedChannelId);
        
        if (channelData) {
          console.log("Channel found:", channelData);
          return channelData;
        }
        
        // Second attempt: Try direct database query with flexible matching
        console.log("Attempting flexible database query for channel:", cleanedChannelId);
        const { data: flexibleMatchData, error: flexError } = await supabase
          .from("youtube_channels")
          .select("*")
          .or(`channel_id.ilike.${cleanedChannelId},title.ilike.%${cleanedChannelId}%`)
          .limit(1);
          
        if (!flexError && flexibleMatchData && flexibleMatchData.length > 0) {
          console.log("Channel found via flexible match:", flexibleMatchData[0]);
          return flexibleMatchData[0];
        }
        
        // Third attempt: Try edge function as last resort
        console.log("Attempting edge function lookup for channel:", cleanedChannelId);
        const { data: apiData, error: apiError } = await supabase.functions.invoke(
          'fetch-channel-details',
          {
            body: { channelId: cleanedChannelId },
          }
        );
        
        if (apiError) {
          console.error("Edge function error:", apiError);
          throw apiError;
        }
        
        if (apiData?.channel) {
          console.log("Channel found via API:", apiData.channel);
          return apiData.channel;
        }
        
        console.warn("No channel data found after multiple attempts for ID:", cleanedChannelId);
        throw new Error("Channel not found");
      } catch (error) {
        console.error("Failed to fetch channel data:", error);
        throw error;
      }
    },
    retry: 3, // Increased from 2 to give more chances
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    meta: {
      onError: (error: Error) => {
        toast.error(`Channel error: ${error.message}`);
      }
    },
    // Do not enable conditionally, as this can cause issues
    // Make sure we attempt the query even if it seems like the ID is not valid
    enabled: true
  });
};

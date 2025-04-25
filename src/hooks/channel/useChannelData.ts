
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getChannelById } from "@/utils/youtube-channel";
import { toast } from "sonner";

export const useChannelData = (channelId: string | undefined) => {
  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");
      
      console.log("useChannelData querying for channel:", channelId);

      try {
        // First attempt: Try to get channel using our enhanced lookup function
        const channelData = await getChannelById(channelId);
        
        if (channelData) {
          console.log("Channel found:", channelData);
          return channelData;
        }
        
        // Second attempt: Try direct database query with flexible matching
        console.log("Attempting flexible database query for channel:", channelId);
        const { data: flexibleMatchData, error: flexError } = await supabase
          .from("youtube_channels")
          .select("*")
          .or(`channel_id.ilike.${channelId},title.ilike.%${channelId}%`)
          .limit(1);
          
        if (!flexError && flexibleMatchData && flexibleMatchData.length > 0) {
          console.log("Channel found via flexible match:", flexibleMatchData[0]);
          return flexibleMatchData[0];
        }
        
        // Third attempt: Try edge function as last resort
        console.log("Attempting edge function lookup for channel:", channelId);
        const { data: apiData, error: apiError } = await supabase.functions.invoke(
          'fetch-channel-details',
          {
            body: { channelId },
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
        
        console.warn("No channel data found after multiple attempts for ID:", channelId);
        throw new Error("Channel not found");
      } catch (error) {
        console.error("Failed to fetch channel data:", error);
        throw error;
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    meta: {
      onError: (error: Error) => {
        toast.error(`Channel error: ${error.message}`);
      }
    }
  });
};

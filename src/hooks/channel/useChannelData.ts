
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getChannelById } from "@/utils/youtube-channel";

export const useChannelData = (channelId: string | undefined) => {
  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");
      
      console.log("useChannelData querying for channel:", channelId);

      try {
        // Use our enhanced channel lookup function
        const channelData = await getChannelById(channelId);
        
        if (!channelData) {
          console.warn("No channel data found for ID:", channelId);
          throw new Error("Channel not found");
        }
        
        return channelData;
      } catch (error) {
        console.error("Failed to fetch channel data:", error);
        throw error;
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

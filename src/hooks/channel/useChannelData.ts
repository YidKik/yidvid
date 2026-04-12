
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getChannelById } from "@/utils/youtube-channel";

export const useChannelData = (channelId: string | undefined) => {
  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      if (!channelId || channelId.trim() === "") {
        throw new Error("Channel ID is required");
      }
      
      const cleanedChannelId = channelId.trim();
      
      try {
        // First attempt: enhanced lookup (already filters deleted_at)
        const channelData = await getChannelById(cleanedChannelId);
        
        if (channelData) {
          return channelData;
        }
        
        // Second attempt: flexible matching with deleted_at filter
        const { data: flexibleMatchData, error: flexError } = await supabase
          .from("youtube_channels")
          .select("*")
          .or(`channel_id.ilike.${cleanedChannelId},title.ilike.%${cleanedChannelId}%`)
          .is("deleted_at", null)
          .limit(1);
          
        if (!flexError && flexibleMatchData && flexibleMatchData.length > 0) {
          return flexibleMatchData[0];
        }
        
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
      suppressToasts: true
    },
    enabled: !!channelId && channelId.trim() !== ""
  });
};
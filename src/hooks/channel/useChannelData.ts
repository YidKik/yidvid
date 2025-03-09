
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChannelData = (channelId: string | undefined) => {
  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("channel_id", channelId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching channel:", error);
        
        // Don't show toast for data access errors or RLS errors
        if (!error.message.includes("recursion") && 
            !error.message.includes("policy") && 
            !error.message.includes("permission")) {
          toast.error("Failed to load channel details", { id: "channel-load-error" });
        }
        
        // Try a simplified query for public data access
        const { data: basicData, error: basicError } = await supabase
          .from("youtube_channels")
          .select("channel_id, title, thumbnail_url")
          .eq("channel_id", channelId)
          .maybeSingle();
          
        if (!basicError && basicData) {
          return basicData;
        }
        
        throw error;
      }

      if (!data) {
        toast.error("Channel not found", { id: "channel-not-found" });
        throw new Error("Channel not found");
      }

      return data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      suppressToasts: true
    }
  });
};

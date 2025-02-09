
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
        toast.error("Failed to load channel details");
        throw error;
      }

      if (!data) {
        toast.error("Channel not found");
        throw new Error("Channel not found");
      }

      return data;
    },
  });
};

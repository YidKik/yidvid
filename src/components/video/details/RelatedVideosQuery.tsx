
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRelatedVideosQuery = (channelId: string, currentVideoId: string) => {
  return useQuery({
    queryKey: ["channel-videos", channelId],
    enabled: !!channelId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .neq("id", currentVideoId)
        .order("uploaded_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    },
  });
};

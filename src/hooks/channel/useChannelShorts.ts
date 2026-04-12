
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useChannelShorts = (channelId: string | undefined) => {
  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ["channel-shorts", channelId],
    queryFn: async () => {
      if (!channelId) return [];

      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .eq("is_short", true)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!channelId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev: any) => prev,
  });

  return { shorts, isLoading };
};

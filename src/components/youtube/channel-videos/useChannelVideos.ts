
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/channel-videos";

export const useChannelVideos = (channelId: string) => {
  return useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      console.log("Fetching videos for channel:", channelId);
      
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false });
            
        if (error) {
          console.error("Error fetching channel videos:", error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} videos for channel ${channelId}`);
        
        if (data && data.length > 0) {
          return data as Video[];
        }
        
        throw new Error("No videos found for this channel");
      } catch (error: any) {
        console.error("Error in channel videos query:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      suppressToasts: true // Don't show toast notifications
    }
  });
};

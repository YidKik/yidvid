
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useVideoQuery = (id: string) => {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      if (!id) throw new Error("No video ID provided");

      console.log("Attempting to fetch video with ID:", id);

      try {
        // First try direct query without joining to avoid RLS recursion issues
        const { data: videoBasic, error: videoBasicError } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("video_id", id)
          .maybeSingle();

        if (!videoBasicError && videoBasic) {
          console.log("Found video by video_id with basic query:", videoBasic);
          
          // Separately fetch the channel thumbnail to avoid join issues
          if (videoBasic.channel_id) {
            const { data: channelData } = await supabase
              .from("youtube_channels")
              .select("thumbnail_url")
              .eq("channel_id", videoBasic.channel_id)
              .maybeSingle();
              
            // Add channel thumbnail to the video data
            if (channelData) {
              videoBasic.youtube_channels = { thumbnail_url: channelData.thumbnail_url };
            }
          }
          
          return videoBasic;
        }

        // If the video_id query failed, check if it's a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(id)) {
          // Try fetching by UUID
          const { data: videoByUuid, error: videoByUuidError } = await supabase
            .from("youtube_videos")
            .select("*")
            .eq("id", id)
            .maybeSingle();

          if (!videoByUuidError && videoByUuid) {
            console.log("Found video by UUID:", videoByUuid);
            
            // Separately fetch the channel thumbnail
            if (videoByUuid.channel_id) {
              const { data: channelData } = await supabase
                .from("youtube_channels")
                .select("thumbnail_url")
                .eq("channel_id", videoByUuid.channel_id)
                .maybeSingle();
                
              if (channelData) {
                videoByUuid.youtube_channels = { thumbnail_url: channelData.thumbnail_url };
              }
            }
            
            return videoByUuid;
          }
        }
        
        // Try a flexible query as fallback
        console.log("Attempting flexible search for video ID:", id);
        const { data: searchResults } = await supabase
          .from("youtube_videos")
          .select("*")
          .ilike("video_id", `%${id}%`)
          .limit(1);
          
        if (searchResults && searchResults.length > 0) {
          console.log("Found video through flexible search:", searchResults[0]);
          
          // Get channel thumbnail
          if (searchResults[0].channel_id) {
            const { data: channelData } = await supabase
              .from("youtube_channels")
              .select("thumbnail_url")
              .eq("channel_id", searchResults[0].channel_id)
              .maybeSingle();
              
            if (channelData) {
              searchResults[0].youtube_channels = { thumbnail_url: channelData.thumbnail_url };
            }
          }
          
          return searchResults[0];
        }

        console.error("Video not found with ID:", id);
        throw new Error("Video not found");
      } catch (error) {
        console.error("Error in video query:", error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 60000, // 1 minute
    meta: {
      suppressToasts: true
    }
  });
};

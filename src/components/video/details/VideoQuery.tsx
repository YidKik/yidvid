
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVideoQuery = (id: string) => {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      if (!id) throw new Error("No video ID provided");

      console.log("Attempting to fetch video with ID:", id);

      try {
        // First try to find by video_id
        const { data: videoByVideoId, error: videoByVideoIdError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .eq("video_id", id)
          .maybeSingle();

        if (videoByVideoIdError) {
          console.error("Error fetching video by video_id:", videoByVideoIdError);
          throw videoByVideoIdError;
        }

        if (videoByVideoId) {
          console.log("Found video by video_id:", videoByVideoId);
          return videoByVideoId;
        }

        // Check if the id is a valid UUID before querying
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          console.error("Invalid video ID format:", id);
          
          // Try a more flexible query as fallback (simulating search)
          const { data: searchResults } = await supabase
            .from("youtube_videos")
            .select("*, youtube_channels(thumbnail_url)")
            .ilike("video_id", `%${id}%`)
            .limit(1);
            
          if (searchResults && searchResults.length > 0) {
            console.log("Found video through fallback search:", searchResults[0]);
            return searchResults[0];
          }
          
          throw new Error("Invalid video ID format");
        }

        // If not found by video_id, try UUID
        const { data: videoByUuid, error: videoByUuidError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .eq("id", id)
          .maybeSingle();

        if (videoByUuidError) {
          console.error("Error fetching video by UUID:", videoByUuidError);
          throw videoByUuidError;
        }

        if (!videoByUuid) {
          console.error("Video not found with ID:", id);
          throw new Error("Video not found");
        }

        console.log("Found video by UUID:", videoByUuid);
        return videoByUuid;
      } catch (error) {
        console.error("Error in video query:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 5000),
    meta: {
      suppressToasts: true
    }
  });
};

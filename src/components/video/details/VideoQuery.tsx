
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { YoutubeVideosTable } from "@/integrations/supabase/types/youtube-videos";

// Extended interface to include the youtube_channels property
interface ExtendedYoutubeVideo extends YoutubeVideosTable {
  youtube_channels?: {
    thumbnail_url: string | null;
  };
}

export const useVideoQuery = (id: string) => {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      if (!id) throw new Error("No video ID provided");

      console.log("Attempting to fetch video with ID:", id);

      try {
        // First try direct query with video_id (YouTube video ID)
        const { data: videoByVideoId, error: videoError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .eq("video_id", id)
          .maybeSingle();

        if (!videoError && videoByVideoId) {
          console.log("Found video by video_id:", videoByVideoId);
          return videoByVideoId;
        }

        // If not found, check if it's a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(id)) {
          // Try fetching by UUID
          const { data: videoByUuid, error: videoByUuidError } = await supabase
            .from("youtube_videos")
            .select("*, youtube_channels(thumbnail_url)")
            .eq("id", id)
            .maybeSingle();

          if (!videoByUuidError && videoByUuid) {
            console.log("Found video by UUID:", videoByUuid);
            return videoByUuid;
          }
        }
        
        // Try a flexible search as fallback
        console.log("Attempting flexible search for video ID:", id);
        const { data: searchResults, error: searchError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .ilike("video_id", `%${id}%`)
          .limit(1);
          
        if (!searchError && searchResults && searchResults.length > 0) {
          console.log("Found video through flexible search:", searchResults[0]);
          return searchResults[0];
        }

        // Try a more aggressive search on both video_id and id fields
        const { data: anyMatches, error: anyMatchesError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .or(`video_id.ilike.%${id}%,id.ilike.%${id}%`)
          .limit(1);
          
        if (!anyMatchesError && anyMatches && anyMatches.length > 0) {
          console.log("Found video through aggressive search:", anyMatches[0]);
          return anyMatches[0];
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

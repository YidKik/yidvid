
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
        
        // Try an anonymous query to bypass any potential RLS issues
        const { data: publicAccess, error: publicError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .or(`video_id.eq.${id},id.eq.${id}`)
          .maybeSingle();
          
        if (!publicError && publicAccess) {
          console.log("Found video through public access query:", publicAccess);
          return publicAccess;
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

        // Last resort: Try fully anonymous fetch (if all else fails)
        try {
          const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos?video_id=${encodeURIComponent(id)}`, {
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.video) {
              console.log("Found video through edge function:", data.video);
              return data.video;
            }
          }
        } catch (edgeError) {
          console.error("Edge function error:", edgeError);
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


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { YoutubeVideosTable } from "@/integrations/supabase/types/youtube-videos";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// Extended interface to include the youtube_channels property
interface ExtendedYoutubeVideo extends YoutubeVideosTable {
  youtube_channels?: {
    thumbnail_url: string | null;
  };
}

export const useVideoQuery = (id: string) => {
  const { isAuthenticated } = useAuth();
  const [attemptedPublicFetch, setAttemptedPublicFetch] = useState(false);
  
  // Track status of authentication to determine query approach
  useEffect(() => {
    if (!isAuthenticated && !attemptedPublicFetch) {
      setAttemptedPublicFetch(true);
    }
  }, [isAuthenticated, attemptedPublicFetch]);
  
  return useQuery({
    queryKey: ["video", id, isAuthenticated],
    queryFn: async () => {
      if (!id) throw new Error("No video ID provided");

      console.log("Attempting to fetch video with ID:", id, "Auth status:", isAuthenticated ? "logged in" : "logged out");

      try {
        // First try direct query with video_id (YouTube video ID)
        const { data: videoByVideoId, error: videoError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .eq("video_id", id)
          .maybeSingle();

        if (!videoError && videoByVideoId) {
          console.log("Found video by video_id:", videoByVideoId);
          return videoByVideoId as ExtendedYoutubeVideo;
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
            return videoByUuid as ExtendedYoutubeVideo;
          }
        }

        // If authenticated queries fail or user is logged out, try public endpoint
        // This ensures videos are accessible regardless of auth state
        try {
          console.log("Attempting public fetch for video ID:", id);
          const response = await fetch(
            `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos?video_id=${encodeURIComponent(id)}`,
            {
              headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.video) {
              console.log("Found video through public edge function:", data.video);
              return data.video as ExtendedYoutubeVideo;
            }
          } else {
            console.warn("Public edge function response not OK:", response.status);
          }
        } catch (edgeError) {
          console.error("Edge function error:", edgeError);
        }
        
        // Try flexible search as fallback
        console.log("Attempting flexible search for video ID:", id);
        const { data: searchResults, error: searchError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .ilike("video_id", `%${id}%`)
          .limit(1);
          
        if (!searchError && searchResults && searchResults.length > 0) {
          console.log("Found video through flexible search:", searchResults[0]);
          return searchResults[0] as ExtendedYoutubeVideo;
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
